import { RecipeRepository } from '../repositories/recipe.repository.js';
import { RecipeCategoryRepository } from '../repositories/recipe-category.repository.js';
import type { RecipeCreateDto, RecipeResponse } from '../schemas/recipe.schema.js';
import { ConflictError } from '../../../../core/errors.js';
import { mapRecipeDoc } from './recipe.get.service.js';

export class RecipeCreateService {
  constructor(
    private repo: RecipeRepository = new RecipeRepository(),
    private categoryRepo: RecipeCategoryRepository = new RecipeCategoryRepository()
  ) {}

  async createRecipe(dto: RecipeCreateDto, userRole?: string | null): Promise<RecipeResponse> {
    // 1. Kiểm tra trùng lặp tên công thức theo chi nhánh
    const existingName = await this.repo.findByName(dto.name, dto.store_id || undefined);
    if (existingName) {
      throw new ConflictError(`Công thức/món với tên "${dto.name}" đã tồn tại ở chi nhánh này!`);
    }

    // 2. Tự động sinh mã công thức nếu để trống
    let code = dto.code?.trim().toUpperCase();
    if (!code) {
      const prefix = dto.type === 'internal_prep' ? 'REC-INT' : 'REC-MNU';
      const total = await this.repo.countTotal();
      code = `${prefix}-${String(total + 1).padStart(3, '0')}`;
    }

    // 3. Kiểm tra trùng mã
    const existingCode = await this.repo.findByCode(code);
    if (existingCode) {
      throw new ConflictError(`Mã công thức "${code}" đã tồn tại! Vui lòng chọn mã khác.`);
    }

    // 4. Tính toán giá vốn ước tính nếu chưa có
    let estimatedCost = dto.estimated_cost ?? 0;
    if (estimatedCost === 0 && dto.ingredients && dto.ingredients.length > 0) {
      estimatedCost = dto.ingredients.reduce((sum, item) => sum + (item.cost || 0), 0);
    }

    // 5. Tự động đồng bộ và lưu danh mục vào table recipe_categories riêng biệt
    let categoryName = dto.category.trim();
    let categoryId = dto.category_id || null;
    if (categoryName) {
      const catDoc = await this.categoryRepo.findOrCreate(categoryName, dto.type);
      categoryId = catDoc._id.toString();
      categoryName = catDoc.name;
    }

    const created = await this.repo.create({
      ...dto,
      code,
      category_id: categoryId,
      category: categoryName,
      estimated_cost: estimatedCost,
    });

    return mapRecipeDoc(created, userRole);
  }
}
