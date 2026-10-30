import mongoose from 'mongoose';
import { OrderRepository } from '../repositories/order.repository.js';
import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { IOrder, IOrderItem } from '../models/order.model.js';
import { StoreConfigModel } from '../../admin_he_thong/store-config/models/store-config.model.js';
import { BadRequestError } from '../../../core/errors.js';

export interface ICheckoutInput {
  storeId: string;
  shiftId?: string;
  sessionCode?: string;
  tableNumber?: string;
  customerName?: string;
  items: Array<{
    recipeId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    toppings?: Array<{ name: string; price: number }>;
    notes?: string;
    addedById?: string;
    addedByName?: string;
  }>;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentMethod: 'VIETQR' | 'CASH' | 'CARD';
  user: {
    userId: string;
    name: string;
  };
}

export class OrderCheckoutService {
  private orderRepo: OrderRepository;
  private sessionRepo: PosSessionRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.sessionRepo = new PosSessionRepository();
  }

  async execute(input: ICheckoutInput): Promise<IOrder> {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestError('Đơn hàng không có món nào để thanh toán.');
    }

    const storeDoc = await StoreConfigModel.findById(input.storeId).lean();
    const storeCode = storeDoc?.store_code || 'CS';
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todayCount = await this.orderRepo.countOrdersToday(input.storeId);
    const orderSeq = String(todayCount + 1).padStart(4, '0');
    const orderCode = `Z6-${storeCode}-${datePrefix}-${orderSeq}`;

    const formattedItems: IOrderItem[] = input.items.map((item) => ({
      recipeId: item.recipeId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      toppings: item.toppings || [],
      notes: item.notes || '',
      addedById: item.addedById || input.user.userId,
      addedByName: item.addedByName || input.user.name,
    }));

    const orderData: Partial<IOrder> = {
      store_id: new mongoose.Types.ObjectId(input.storeId),
      shift_id: input.shiftId && mongoose.Types.ObjectId.isValid(input.shiftId)
        ? new mongoose.Types.ObjectId(input.shiftId)
        : undefined,
      order_code: orderCode,
      table_number: input.tableNumber || '',
      customer_name: input.customerName || 'Khách lẻ',
      items: formattedItems,
      total_amount: input.totalAmount,
      discount_amount: input.discountAmount || 0,
      final_amount: input.finalAmount,
      payment_method: input.paymentMethod,
      payment_status: 'COMPLETED',
      created_by_id: new mongoose.Types.ObjectId(input.user.userId),
      created_by_name: input.user.name,
      paid_by_id: new mongoose.Types.ObjectId(input.user.userId),
      paid_by_name: input.user.name,
      paid_at: new Date(),
    };

    const newOrder = await this.orderRepo.createOrder(orderData);

    // Làm sạch giỏ hàng của session nếu có sessionCode
    if (input.sessionCode) {
      await this.sessionRepo.clearCart(input.sessionCode);
    }

    return newOrder;
  }
}
