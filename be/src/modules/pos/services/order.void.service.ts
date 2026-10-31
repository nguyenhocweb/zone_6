import mongoose from 'mongoose';
import { OrderModel, IOrder } from '../models/order.model.js';
import { TableRepository } from '../../admin_he_thong/table/repositories/table.repository.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { emitPosEvent } from '../socket/pos.socket.js';

export interface VoidOrderPayload {
  orderId: string;
  voidReason: string;
  actor: {
    userId: string;
    name: string;
    role: string;
  };
}

export class OrderVoidService {
  private tableRepo: TableRepository;

  constructor() {
    this.tableRepo = new TableRepository();
  }

  async execute(dto: VoidOrderPayload): Promise<IOrder> {
    const allowedRoles = ['admin_he_thong', 'quan_ly', 'truong_ca'];
    if (!allowedRoles.includes(dto.actor.role)) {
      throw new ForbiddenError('Chỉ Quản lý, Trưởng ca hoặc Admin mới có quyền hủy hóa đơn!');
    }

    if (!dto.voidReason || dto.voidReason.trim().length < 3) {
      throw new BadRequestError('Vui lòng nhập lý do hủy hóa đơn rõ ràng (tối thiểu 3 ký tự)!');
    }

    const order = await OrderModel.findById(dto.orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy hóa đơn cần hủy!');
    }

    if (order.payment_status === 'CANCELLED') {
      throw new BadRequestError('Hóa đơn này đã được hủy trước đó!');
    }

    order.payment_status = 'CANCELLED';
    order.void_reason = dto.voidReason.trim();
    order.voided_by_id = new mongoose.Types.ObjectId(dto.actor.userId);
    order.voided_by_name = dto.actor.name;
    order.voided_at = new Date();
    await order.save();

    // Nếu đơn có bàn, trả trạng thái bàn về AVAILABLE
    if (order.table_id) {
      await this.tableRepo.update(order.table_id.toString(), { status: 'AVAILABLE' });
    }

    emitPosEvent(order.store_id.toString(), 'pos:order_voided', {
      orderId: order._id.toString(),
      orderCode: order.order_code,
      voidedByName: dto.actor.name,
      voidReason: dto.voidReason,
    });

    return order;
  }
}
