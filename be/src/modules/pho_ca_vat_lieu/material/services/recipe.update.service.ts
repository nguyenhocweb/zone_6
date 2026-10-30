import { RecipeRepository } from '../repositories/recipe.repository.js';
import { RecipeCategoryRepository } from '../repositories/recipe-category.repository.js';
import type { RecipeResponse, RecipeUpdateDto } from '../schemas/recipe.schema.js';
import { ConflictError, NotFoundError } from '../../../../core/errors.js';
import { mapRecipeDoc } from './recipe.get.service.js';

export class RecipeUpdateService {
  constructor(
    private repo: RecipeRepository = new RecipeRepository(),
    private categoryRepo: RecipeCategoryRepository = new RecipeCategoryRepository()
  ) {}

  async updateRecipe(id: string, dto: RecipeUpdateDto, userRole?: string | null): Promise<RecipeResponse> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy công thức/món với ID: ${id}`);
    }

    if (dto.name && dto.name.trim() !== existing.name) {
      const duplicateName = await this.repo.findByName(dto.name);
      if (duplicateName && duplicateName._id.toString() !== id) {
        throw new ConflictError(`Tên công thức/món "${dto.name}" đã được sử dụng!`);
      }
    }

    if (dto.code && dto.code.trim().toUpperCase() !== existing.code) {
      const upperCode = dto.code.trim().toUpperCase();
      const duplicateCode = await this.repo.findByCode(upperCode);
      if (duplicateCode && duplicateCode._id.toString() !== id) {
        throw new ConflictError(`Mã công thức "${upperCode}" đã tồn tại!`);
      }
      dto.code = upperCode;
    }

    // Tự động tính lại giá vốn nếu cập nhật thành phần nguyên vật liệu
    if (dto.ingredients && dto.estimated_cost === undefined) {
      dto.estimated_cost = dto.ingredients.reduce((sum, item) => sum + (item.cost || 0), 0);
    }

    // Tự động đồng bộ và lưu danh mục vào table recipe_categories riêng biệt nếu có thay đổi
    if (dto.category && dto.category.trim()) {
      const targetType = dto.type || existing.type;
      const catDoc = await this.categoryRepo.findOrCreate(dto.category.trim(), targetType);
      dto.category_id = catDoc._id.toString();
      dto.category = catDoc.name;
    }

    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Cập nhật công thức thất bại`);
    }

    return mapRecipeDoc(updated, userRole);
  }
}
