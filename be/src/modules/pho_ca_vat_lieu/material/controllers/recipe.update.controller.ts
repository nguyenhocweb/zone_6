import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RecipeUpdateService } from '../services/recipe.update.service.js';
import { RecipeUpdateSchema } from '../schemas/recipe.schema.js';

export class RecipeUpdateController {
  constructor(private service: RecipeUpdateService = new RecipeUpdateService()) {}

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userRole = (req as any).user?.role || null;
    const validated = RecipeUpdateSchema.parse(req.body);
    const data = await this.service.updateRecipe(id, validated, userRole);

    return res.status(200).json({
      success: true,
      data,
      message: `Cập nhật công thức/món "${data.name}" thành công`,
    });
  });
}
