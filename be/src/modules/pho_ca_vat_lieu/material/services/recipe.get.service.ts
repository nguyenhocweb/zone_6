import { RecipeRepository } from '../repositories/recipe.repository.js';
import type { RecipeListResponse, RecipeResponse } from '../schemas/recipe.schema.js';
import { NotFoundError } from '../../../../core/errors.js';
import type { IRecipeDoc } from '../models/recipe.model.js';

// Danh sách các vai trò nội bộ từ Nhân Viên trở lên được xem bí quyết công thức
export const STAFF_AND_ABOVE_ROLES = [
  'admin_he_thong',
  'quan_ly',
  'truong_ca',
  'pho_ca_vat_lieu',
  'pho_ca_lam_lich',
  'nhan_vien',
];

export function mapRecipeDoc(doc: IRecipeDoc, userRole?: string | null): RecipeResponse {
  const hasAccess = userRole ? STAFF_AND_ABOVE_ROLES.includes(userRole) : false;

  const base: RecipeResponse = {
    id: doc._id.toString(),
    store_id: doc.store_id ? doc.store_id.toString() : null,
    name: doc.name,
    code: doc.code,
    type: doc.type,
    category_id: doc.category_id ? doc.category_id.toString() : null,
    category: doc.category,
    price: doc.price ?? 0,
    description: doc.description || null,
    image_url: doc.image_url || null,
    serving_size: doc.serving_size || '1 ly',
    serving_mode: (doc.serving_mode as any) || 'cold',
    cold_cup_id: doc.cold_cup_id ? doc.cold_cup_id.toString() : null,
    cold_cup_name: doc.cold_cup_name || null,
    hot_cup_id: doc.hot_cup_id ? doc.hot_cup_id.toString() : null,
    hot_cup_name: doc.hot_cup_name || null,
    prep_time_minutes: doc.prep_time_minutes ?? 5,
    shelf_life: doc.shelf_life || null,
    storage_method: doc.storage_method || null,
    ingredients_count: doc.ingredients?.length ?? 0,
    steps_count: doc.steps?.length ?? 0,
    has_recipe_access: hasAccess,
    is_active: doc.is_active !== false,
    created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
    updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : new Date().toISOString(),
  };

  // NẾU LÀ NHÂN VIÊN TRỞ LÊN: MỚI ĐƯỢC XEM ĐỊNH LƯỢNG NGUYÊN VẬT LIỆU, CÁC BƯỚC PHA CHẾ & GIÁ VỐN
  if (hasAccess) {
    base.estimated_cost = doc.estimated_cost ?? 0;
    base.ingredients = (doc.ingredients || []).map((ing) => ({
      material_id: ing.material_id ? ing.material_id.toString() : null,
      material_name: ing.material_name,
      quantity: ing.quantity,
      unit: ing.unit,
      cost: ing.cost ?? 0,
      notes: ing.notes || null,
    }));
    base.steps = (doc.steps || []).map((step) => ({
      step_number: step.step_number,
      title: step.title,
      instruction: step.instruction,
      duration_seconds: step.duration_seconds || null,
      tips: step.tips || null,
    }));
  }

  return base;
}

export class RecipeGetService {
  constructor(private repo: RecipeRepository = new RecipeRepository()) {}

  async getAllRecipes(
    filters?: {
      store_id?: string;
      type?: string;
      category?: string;
      search?: string;
      is_active?: boolean;
    },
    userRole?: string | null
  ): Promise<RecipeListResponse> {
    const hasAccess = userRole ? STAFF_AND_ABOVE_ROLES.includes(userRole) : false;

    // RÀNG BUỘC BẢO MẬT: NẾU LÀ KHÁCH HÀNG / CHƯA ĐĂNG NHẬP -> CHỈ ĐƯỢC XEM MÓN BÁN (customer_product)
    const activeFilters = { ...filters };
    if (!hasAccess) {
      activeFilters.type = 'customer_product';
    }

    const [docs, total, internalPrepCount, customerProductCount] = await Promise.all([
      this.repo.findAll(activeFilters),
      this.repo.countTotal(activeFilters.store_id),
      this.repo.countByType('internal_prep', activeFilters.store_id),
      this.repo.countByType('customer_product', activeFilters.store_id),
    ]);

    return {
      recipes: docs.map((doc) => mapRecipeDoc(doc, userRole)),
      total,
      internal_prep_count: internalPrepCount,
      customer_product_count: customerProductCount,
    };
  }

  async getRecipeById(id: string, userRole?: string | null): Promise<RecipeResponse> {
    const doc = await this.repo.findById(id);
    if (!doc) {
      throw new NotFoundError(`Không tìm thấy công thức/món với ID: ${id}`);
    }

    const hasAccess = userRole ? STAFF_AND_ABOVE_ROLES.includes(userRole) : false;

    // Khách hàng không được truy cập món sơ chế nội bộ
    if (!hasAccess && doc.type === 'internal_prep') {
      throw new NotFoundError(`Không tìm thấy món với ID: ${id}`);
    }

    return mapRecipeDoc(doc, userRole);
  }
}
