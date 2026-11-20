import { OrderRepository } from '../repositories/order.repository.js';
import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { NotFoundError } from '../../../core/errors.js';
import { emitPosEvent } from '../socket/pos.socket.js';

export class OrderStatusService {
  private orderRepo: OrderRepository;
  private sessionRepo: PosSessionRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.sessionRepo = new PosSessionRepository();
  }

  async getStatusByCode(orderCode: string) {
    const order = await this.orderRepo.findByOrderCode(orderCode);
    if (!order) {
      throw new NotFoundError(`Không tìm thấy đơn hàng ${orderCode}`);
    }

    return {
      orderId: order._id.toString(),
      orderCode: order.order_code,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      finalAmount: order.final_amount,
      paidAt: order.paid_at,
    };
  }

  async cancelOrder(orderId: string, sessionCode?: string) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng để hủy');
    }

    const updated = await this.orderRepo.updatePaymentStatus(orderId, 'CANCELLED', {
      void_reason: 'Khách hàng hoặc Thu ngân hủy giao dịch VietQR',
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
    }

    return updated;
  }
}
