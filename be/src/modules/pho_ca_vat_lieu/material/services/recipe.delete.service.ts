import { RecipeRepository } from '../repositories/recipe.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class RecipeDeleteService {
  constructor(private repo: RecipeRepository = new RecipeRepository()) {}

  async deleteRecipe(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy công thức/món với ID: ${id}`);
    }

    await this.repo.delete(id);
    return {
      success: true,
      message: `Đã xóa công thức/món "${existing.name}" khỏi hệ thống.`,
    };
  }
}
