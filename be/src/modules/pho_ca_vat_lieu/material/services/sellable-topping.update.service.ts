import { SellableToppingRepository } from '../repositories/sellable-topping.repository.js';
import type { SellableToppingUpdateDto, SellableToppingResponse } from '../schemas/sellable-topping.schema.js';
import { NotFoundError } from '../../../../core/errors.js';

export class SellableToppingUpdateService {
  constructor(private repo: SellableToppingRepository = new SellableToppingRepository()) {}

  async execute(id: string, dto: SellableToppingUpdateDto): Promise<SellableToppingResponse> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError('Không tìm thấy topping bán ra để cập nhật');
    }

    const cost = updated.cost_estimate || 0;
    const price = updated.selling_price || 0;
    const profit = price - cost;
    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

    return {
      id: updated._id.toString(),
      store_id: updated.store_id?.toString() || null,
      topping_id: updated.topping_id?.toString() || null,
      name: updated.name,
      code: updated.code,
      portion_unit: updated.portion_unit,
      selling_price: price,
      cost_estimate: cost,
      gross_profit_margin: margin,
      description: updated.description || null,
      is_active: updated.is_active,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    };
  }
}
