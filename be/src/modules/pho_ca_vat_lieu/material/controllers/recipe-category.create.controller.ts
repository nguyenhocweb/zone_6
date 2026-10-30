import type { Request, Response } from 'express';
import { RecipeCategoryCreateService } from '../services/recipe-category.create.service.js';
import { RecipeCategoryCreateSchema } from '../schemas/recipe-category.schema.js';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';

export class RecipeCategoryCreateController {
  private createService: RecipeCategoryCreateService;

  constructor() {
    this.createService = new RecipeCategoryCreateService();
  }

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = RecipeCategoryCreateSchema.parse(req.body);
    const result = await this.createService.create(validatedData);

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục món mới thành công',
      data: result,
    });
  });
}
