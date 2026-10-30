import { RecipeCategoryRepository } from '../repositories/recipe-category.repository.js';
import type { RecipeCategoryCreateDto, RecipeCategoryResponse } from '../schemas/recipe-category.schema.js';
import type { IRecipeCategoryDoc } from '../models/recipe-category.model.js';
import { ConflictError } from '../../../../core/errors.js';

export class RecipeCategoryCreateService {
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

  async create(dto: RecipeCategoryCreateDto): Promise<RecipeCategoryResponse> {
    const existing = await this.categoryRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictError(`Danh mục món '${dto.name}' đã tồn tại trong hệ thống`);
    }

    const doc = await this.categoryRepo.create(dto);
    return this.mapDoc(doc);
  }
}
