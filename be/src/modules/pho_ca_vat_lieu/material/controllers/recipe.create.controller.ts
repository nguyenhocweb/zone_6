import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RecipeCreateService } from '../services/recipe.create.service.js';
import { RecipeCreateSchema } from '../schemas/recipe.schema.js';

export class RecipeCreateController {
  constructor(private service: RecipeCreateService = new RecipeCreateService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const userRole = user?.role || null;

    const payload = { ...req.body };
    if (!payload.store_id && user?.assigned_store_id) {
      payload.store_id = String(user.assigned_store_id);
    }

    const validated = RecipeCreateSchema.parse(payload);
    const data = await this.service.createRecipe(validated, userRole);

    return res.status(201).json({
      success: true,
      data,
      message: `Tạo công thức/món "${data.name}" thành công`,
    });
  });
}
