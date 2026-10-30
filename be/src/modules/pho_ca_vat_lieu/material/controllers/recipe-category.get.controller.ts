import type { Request, Response } from 'express';
import { RecipeCategoryGetService } from '../services/recipe-category.get.service.js';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';

export class RecipeCategoryGetController {
  private getService: RecipeCategoryGetService;

  constructor() {
    this.getService = new RecipeCategoryGetService();
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type, is_active, search } = req.query;

    const result = await this.getService.getAll({
      type: type as string | undefined,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search: search as string | undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const category = await this.getService.getById(Array.isArray(id) ? id[0] : id);

    res.status(200).json({
      success: true,
      data: category,
    });
  });
}
