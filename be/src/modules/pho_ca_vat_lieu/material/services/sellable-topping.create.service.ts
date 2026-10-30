import { SellableToppingRepository } from '../repositories/sellable-topping.repository.js';
import type { SellableToppingCreateDto, SellableToppingResponse } from '../schemas/sellable-topping.schema.js';
import { ConflictError } from '../../../../core/errors.js';

export class SellableToppingCreateService {
  constructor(private repo: SellableToppingRepository = new SellableToppingRepository()) {}

  async execute(dto: SellableToppingCreateDto): Promise<SellableToppingResponse> {
    if (dto.code) {
      const existing = await this.repo.findByCode(dto.code);
      if (existing) {
        throw new ConflictError(`Mã topping bán ra ${dto.code} đã tồn tại`);
      }
    }

    const doc = await this.repo.create(dto);
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
