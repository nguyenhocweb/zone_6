import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { ILiveCart } from '../models/pos-session.model.js';
import { IOrderItem } from '../models/order.model.js';
import { BadRequestError } from '../../../core/errors.js';

export interface IUpdateCartInput {
  sessionCode: string;
  items: Array<{
    recipeId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    toppings?: Array<{ name: string; price: number }>;
    notes?: string;
  }>;
  tableNumber?: string;
  customerName?: string;
  discount?: number;
  user: {
    userId: string;
    name: string;
  };
}

export class PosCartUpdateService {
  private repo: PosSessionRepository;

  constructor() {
    this.repo = new PosSessionRepository();
  }

  async execute(input: IUpdateCartInput): Promise<ILiveCart> {
    const existing = await this.repo.getSessionByCode(input.sessionCode);
    if (!existing) {
      throw new BadRequestError('Không tìm thấy phiên làm việc POS tương ứng.');
    }

    if (existing.current_cart?.lockedBy && existing.current_cart.lockedBy !== input.user.userId) {
      throw new BadRequestError(
        `Đơn hàng đang bị khóa thanh toán bởi nhân viên: ${existing.current_cart.lockedByName || 'Đồng nghiệp'}. Vui lòng chờ hoàn tất!`
      );
    }

    // Tính toán lại tổng tiền subtotal
    let subtotal = 0;
    const formattedItems: IOrderItem[] = input.items.map((item) => {
      let itemToppingTotal = 0;
      if (item.toppings && Array.isArray(item.toppings)) {
        itemToppingTotal = item.toppings.reduce((acc, t) => acc + (t.price || 0), 0);
      }
      const itemSubtotal = (item.unitPrice + itemToppingTotal) * item.quantity;
      subtotal += itemSubtotal;

      return {
        recipeId: item.recipeId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemSubtotal,
        toppings: item.toppings || [],
        notes: item.notes || '',
        addedById: input.user.userId,
        addedByName: input.user.name,
      };
    });

    const discount = input.discount || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const updatedCart: ILiveCart = {
      items: formattedItems,
      subtotal,
      discount,
      finalTotal,
      tableNumber: input.tableNumber || '',
      customerName: input.customerName || 'Khách lẻ',
      lockedBy: existing.current_cart?.lockedBy || null,
      lockedByName: existing.current_cart?.lockedByName || null,
      lockedAt: existing.current_cart?.lockedAt || null,
    };

    const session = await this.repo.updateCart(input.sessionCode, updatedCart);
    return session?.current_cart || updatedCart;
  }
}
