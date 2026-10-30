import { OrderRepository } from '../repositories/order.repository.js';
import { IOrder } from '../models/order.model.js';

export class OrderHistoryService {
  private repo: OrderRepository;

  constructor() {
    this.repo = new OrderRepository();
  }

  async execute(storeId: string, limit: number = 30): Promise<IOrder[]> {
    return this.repo.getOrdersByStore(storeId, limit);
  }
}
