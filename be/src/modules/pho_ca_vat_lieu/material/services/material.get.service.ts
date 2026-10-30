import { MaterialRepository, type UnifiedMaterialItem } from '../repositories/material.repository.js';
import type { MaterialListResponse, MaterialResponse } from '../schemas/material.schema.js';
import { NotFoundError } from '../../../../core/errors.js';

export function mapMaterialDoc(doc: UnifiedMaterialItem | any): MaterialResponse {
  const isLowStock = doc.quantity_in_stock <= doc.min_threshold;
  const docId = doc.id || (doc._id ? doc._id.toString() : '');
  const storeId = doc.store_id ? doc.store_id.toString() : null;

  return {
    id: docId,
    store_id: storeId,
    name: doc.name,
    code: doc.code,
    category: doc.category,
    unit: doc.unit,
    cost_per_unit: doc.cost_per_unit ?? 0,
    quantity_in_stock: doc.quantity_in_stock ?? 0,
    min_threshold: doc.min_threshold ?? 10,
    is_low_stock: isLowStock,
    temperature_mode: doc.temperature_mode || (doc.category === 'packaging' ? 'both' : undefined),
    cup_size: doc.cup_size || null,
    usage_scope: doc.usage_scope || (doc.category === 'ingredient' ? 'both' : undefined),
    portion_unit: doc.portion_unit || null,
    selling_price: doc.selling_price ?? 0,
    description: doc.description || null,
    is_active: doc.is_active !== false,
    created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
    updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : new Date().toISOString(),
  };
}

export class MaterialGetService {
  constructor(private repo: MaterialRepository = new MaterialRepository()) {}

  async getAllMaterials(filters?: {
    category?: string;
    search?: string;
    is_active?: boolean;
    store_id?: string;
  }): Promise<MaterialListResponse> {
    // Tự động kiểm tra và khởi tạo dữ liệu mẫu nếu DB trống
    await this.repo.seedInitialMaterials();

    const [docs, total, packagingCount, ingredientCount, lowStockCount] = await Promise.all([
      this.repo.findAll(filters),
      this.repo.countTotal(filters?.store_id),
      this.repo.countByCategory('packaging', filters?.store_id),
      this.repo.countByCategory('ingredient', filters?.store_id),
      this.repo.countLowStock(filters?.store_id),
    ]);

    return {
      materials: docs.map(mapMaterialDoc),
      total,
      packaging_count: packagingCount,
      ingredient_count: ingredientCount,
      low_stock_count: lowStockCount,
    };
  }

  async getMaterialById(id: string): Promise<MaterialResponse> {
    const doc = await this.repo.findById(id);
    if (!doc) {
      throw new NotFoundError(`Không tìm thấy nguyên vật liệu với ID: ${id}`);
    }
    return mapMaterialDoc(doc);
  }
}
