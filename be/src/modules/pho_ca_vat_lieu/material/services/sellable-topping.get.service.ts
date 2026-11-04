import { SellableToppingRepository } from '../repositories/sellable-topping.repository.js';
import type { SellableToppingListResponse, SellableToppingResponse } from '../schemas/sellable-topping.schema.js';
import { NotFoundError } from '../../../../core/errors.js';

export class SellableToppingGetService {
  constructor(private repo: SellableToppingRepository = new SellableToppingRepository()) {}

  async getAll(filters?: { store_id?: string; is_active?: boolean; search?: string }): Promise<SellableToppingListResponse> {
    const items = await this.repo.findAll(filters);
    return {
      items,
      total: items.length,
    };
  }

  async getById(id: string): Promise<SellableToppingResponse> {
    const doc = await this.repo.findById(id);
    if (!doc) {
      throw new NotFoundError('Không tìm thấy topping bán ra');
    }
    const cost = doc.cost_estimate || 0;
    const price = doc.selling_price || 0;
    const profit = price - cost;
    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

    return {
      id: doc._id.toString(),
      store_id: doc.store_id?.toString() || null,
      topping_id: doc.topping_id?.toString() || null,
      name: doc.name,
      code: doc.code,
      portion_unit: doc.portion_unit,
      selling_price: price,
      cost_estimate: cost,
      gross_profit_margin: margin,
      description: doc.description || null,
      is_active: doc.is_active,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }
}
