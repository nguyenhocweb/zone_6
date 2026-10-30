import { RecipeCategoryRepository } from '../repositories/recipe-category.repository.js';
import type { RecipeCategoryResponse } from '../schemas/recipe-category.schema.js';
import type { IRecipeCategoryDoc } from '../models/recipe-category.model.js';
import { NotFoundError } from '../../../../core/errors.js';

export class RecipeCategoryGetService {
  private categoryRepo: RecipeCategoryRepository;

  constructor() {
    this.categoryRepo = new RecipeCategoryRepository();
  }

  private mapDoc(doc: IRecipeCategoryDoc): RecipeCategoryResponse {
    return {
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code || null,
      description: doc.description || null,
      type: doc.type || 'both',
      is_active: doc.is_active,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async getAll(filters?: {
    type?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<{ categories: RecipeCategoryResponse[]; total: number }> {
    const docs = await this.categoryRepo.findAll(filters);
    const categories = docs.map((d) => this.mapDoc(d));
    return {
      categories,
      total: categories.length,
    };
  }

  async getById(id: string): Promise<RecipeCategoryResponse> {
    const doc = await this.categoryRepo.findById(id);
    if (!doc) {
      throw new NotFoundError(`Không tìm thấy danh mục món với ID: ${id}`);
    }
    return this.mapDoc(doc);
  }
}
