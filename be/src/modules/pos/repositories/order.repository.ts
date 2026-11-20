import mongoose from 'mongoose';
import { OrderModel, IOrder } from '../models/order.model.js';

export class OrderRepository {
  async createOrder(data: Partial<IOrder>): Promise<IOrder> {
    return OrderModel.create(data);
  }

  async getOrdersByStore(storeId: string, limit: number = 50): Promise<IOrder[]> {
    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    return OrderModel.find({ store_id: storeObjectId })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }

  async getOrderById(orderId: string): Promise<IOrder | null> {
    return OrderModel.findById(orderId).lean();
  }

  async countOrdersToday(storeId: string): Promise<number> {
    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return OrderModel.countDocuments({
      store_id: storeObjectId,
      created_at: { $gte: startOfDay },
    });
  }

  async findByOrderCode(orderCode: string): Promise<IOrder | null> {
    if (!orderCode) return null;
    return OrderModel.findOne({ order_code: orderCode.trim() }).exec();
  }

  async findByPayOSOrderCode(orderCode: number | string): Promise<IOrder | null> {
    if (!orderCode) return null;
    const num = Number(orderCode);
    if (!isNaN(num)) {
      const order = await OrderModel.findOne({ payos_order_code: num }).exec();
      if (order) return order;
    }
    return OrderModel.findOne({ order_code: String(orderCode).trim() }).exec();
  }

  async findPendingByDescription(description: string): Promise<IOrder | null> {
    if (!description) return null;
    const cleanDesc = description.trim();

    // 1. Thử tìm chính xác theo mã đơn
    let order = await OrderModel.findOne({
      order_code: cleanDesc,
      payment_status: 'PENDING',
    }).exec();
    if (order) return order;

    // 2. Thử tìm theo biểu thức chứa mã đơn trong chuỗi nội dung chuyển khoản
    // Ví dụ description = "Chuyen khoan Z6-CS-20261120-0005"
    const words = cleanDesc.split(/[\s,._-]+/);
    for (const w of words) {
      if (w.length >= 6) {
        order = await OrderModel.findOne({
          order_code: { $regex: new RegExp(w, 'i') },
          payment_status: 'PENDING',
        }).exec();
        if (order) return order;
      }
    }

    // 3. Fallback: làm sạch ký tự đặc biệt để so khớp chuỗi không dấu
    const normalizedDesc = cleanDesc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const pendingOrders = await OrderModel.find({ payment_status: 'PENDING' })
      .sort({ created_at: -1 })
      .limit(20)
      .exec();

    for (const pOrder of pendingOrders) {
      const normalizedCode = pOrder.order_code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (normalizedDesc.includes(normalizedCode) || normalizedCode.includes(normalizedDesc)) {
        return pOrder;
      }
    }

    return null;
  }

  async updatePaymentStatus(
    orderId: string,
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED',
    extra: Record<string, any> = {}
  ): Promise<IOrder | null> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
    return OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          payment_status: status,
          ...extra,
        },
      },
      { new: true }
    ).exec();
  }
}

