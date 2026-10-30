import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RecipeDeleteService } from '../services/recipe.delete.service.js';

export class RecipeDeleteController {
  constructor(private service: RecipeDeleteService = new RecipeDeleteService()) {}

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await this.service.deleteRecipe(id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
