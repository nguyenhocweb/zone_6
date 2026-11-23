import mongoose from 'mongoose';
import { OrderRepository } from '../repositories/order.repository.js';
import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { TableRepository } from '../../admin_he_thong/table/repositories/table.repository.js';
import { NotFoundError, ConflictError } from '../../../core/errors.js';
import { emitPosEvent } from '../socket/pos.socket.js';
import { emitTableEvent } from '../../admin_he_thong/table/socket/table.socket.js';

export class OrderStatusService {
  private orderRepo: OrderRepository;
  private sessionRepo: PosSessionRepository;
  private tableRepo: TableRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.sessionRepo = new PosSessionRepository();
    this.tableRepo = new TableRepository();
  }

  async getStatusByCode(orderCode: string) {
    const order = await this.orderRepo.findByOrderCode(orderCode);
    if (!order) {
      throw new NotFoundError(`Không tìm thấy đơn hàng ${orderCode}`);
    }

    // TỰ ĐỘNG HỦY ĐƠN TIỀN MẶT QUÁ 30 PHÚT CHƯA THU NGÂN XÁC NHẬN
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    const isCashPending = order.payment_method === 'CASH' && order.payment_status === 'PENDING';
    const elapsedMs = order.created_at ? Date.now() - new Date(order.created_at).getTime() : 0;

    if (isCashPending && elapsedMs >= THIRTY_MINUTES_MS) {
      await this.orderRepo.updatePaymentStatus(order._id.toString(), 'CANCELLED', {
        void_reason: 'Tự động hủy: Quá 30 phút nhân viên ca trực chưa xác nhận thu tiền mặt tại quầy',
        voided_at: new Date(),
      });

      if (order.table_id) {
        await this.tableRepo.update(order.table_id.toString(), { status: 'AVAILABLE' });
        if (order.store_id) {
          emitTableEvent(order.store_id.toString(), 'table:updated', {
            tableId: order.table_id.toString(),
            status: 'AVAILABLE',
            actionUser: { name: 'Hệ Thống (Tự động hủy đơn tiền mặt quá 30p)' },
          });
        }
      }

      if (order.store_id) {
        emitPosEvent(order.store_id.toString(), 'pos:order_cancelled', {
          orderId: order._id.toString(),
          orderCode: order.order_code,
          reason: 'Quá 30 phút chưa thanh toán tiền mặt tại quầy',
        });
        emitPosEvent(order.store_id.toString(), 'pos:order_status_updated', {
          orderId: order._id.toString(),
          orderCode: order.order_code,
          paymentStatus: 'CANCELLED',
        });
      }

      return {
        orderId: order._id.toString(),
        orderCode: order.order_code,
        paymentStatus: 'CANCELLED',
        paymentMethod: order.payment_method,
        finalAmount: order.final_amount,
        isExpired: true,
        voidReason: 'Quá 30 phút chưa thanh toán tiền mặt tại quầy',
        createdAt: order.created_at,
      };
    }

    return {
      orderId: order._id.toString(),
      orderCode: order.order_code,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      finalAmount: order.final_amount,
      paidAt: order.paid_at,
      createdAt: order.created_at,
      voidReason: order.void_reason,
    };
  }

  async confirmCashPayment(orderId: string, actor?: { id?: string; name?: string }) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng để xác nhận thanh toán');
    }

    if (order.payment_status === 'COMPLETED') {
      return order;
    }

    if (order.payment_status === 'CANCELLED') {
      throw new ConflictError('Đơn hàng đã bị hủy, không thể xác nhận thanh toán');
    }

    const updated = await this.orderRepo.updatePaymentStatus(orderId, 'COMPLETED', {
      paid_at: new Date(),
      paid_by_id: actor?.id ? new mongoose.Types.ObjectId(actor.id) : undefined,
      paid_by_name: actor?.name || 'Thu Ngân Ca Trực',
    });

    if (order.store_id) {
      emitPosEvent(order.store_id.toString(), 'pos:payment_success', {
        orderCode: order.order_code,
        amount: order.final_amount,
        order: updated,
      });
      emitPosEvent(order.store_id.toString(), 'pos:order_status_updated', {
        orderId: order._id.toString(),
        orderCode: order.order_code,
        paymentStatus: 'COMPLETED',
      });
    }

    return updated;
  }

  async cancelOrder(orderId: string, sessionCode?: string) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng để hủy');
    }

    const updated = await this.orderRepo.updatePaymentStatus(orderId, 'CANCELLED', {
      void_reason: 'Khách hàng hoặc Thu ngân hủy giao dịch',
      voided_at: new Date(),
    });

    if (sessionCode) {
      await this.sessionRepo.lockCart(sessionCode, null, null);
    }

    if (order.store_id) {
      emitPosEvent(order.store_id.toString(), 'pos:order_cancelled', {
        orderId,
        orderCode: order.order_code,
      });
      emitPosEvent(order.store_id.toString(), 'pos:order_status_updated', {
        orderId,
        orderCode: order.order_code,
        paymentStatus: 'CANCELLED',
      });
    }

    return updated;
  }
}
