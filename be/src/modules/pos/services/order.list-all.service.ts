import mongoose from 'mongoose';
import { OrderModel, IOrder } from '../models/order.model.js';

export interface OrderListFilter {
  store_id: string;
  startDate?: string;
  endDate?: string;
  shift_id?: string;
  table_number?: string;
  payment_status?: string;
  order_source?: string;
  payment_method?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderListResult {
  orders: IOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

export class OrderListAllService {
  async execute(filter: OrderListFilter): Promise<OrderListResult> {
    const query: any = {
      store_id: new mongoose.Types.ObjectId(filter.store_id),
    };

    if (filter.startDate || filter.endDate) {
      query.created_at = {};
      if (filter.startDate) {
        query.created_at.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
        query.created_at.$lte = end;
      }
    }

    if (filter.shift_id) {
      query.shift_id = new mongoose.Types.ObjectId(filter.shift_id);
    }

    if (filter.table_number) {
      query.table_number = filter.table_number;
    }

    if (filter.payment_status) {
      query.payment_status = filter.payment_status;
    }

    if (filter.order_source) {
      query.order_source = filter.order_source;
    }

    if (filter.payment_method) {
      query.payment_method = filter.payment_method;
    }

    if (filter.search && filter.search.trim()) {
      const regex = new RegExp(filter.search.trim(), 'i');
      query.$or = [{ order_code: regex }, { customer_name: regex }, { table_number: regex }];
    }

    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total, stats] = await Promise.all([
      OrderModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      OrderModel.countDocuments(query).exec(),
      OrderModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$payment_status', 'COMPLETED'] }, '$final_amount', 0],
              },
            },
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$payment_status', 'COMPLETED'] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$payment_status', 'CANCELLED'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summaryData = stats[0] || {
      totalRevenue: 0,
      totalOrders: total,
      completedOrders: 0,
      cancelledOrders: 0,
    };

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: summaryData,
    };
  }
}

