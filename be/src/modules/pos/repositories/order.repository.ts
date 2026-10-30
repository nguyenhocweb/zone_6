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
}

