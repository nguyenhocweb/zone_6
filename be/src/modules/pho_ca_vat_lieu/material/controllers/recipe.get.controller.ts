import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RecipeGetService } from '../services/recipe.get.service.js';

export class RecipeGetController {
  constructor(private service: RecipeGetService = new RecipeGetService()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const { type, category, search, is_active } = req.query;

    // Phân quyền chi nhánh (Store Scoping):
    // - Admin hoặc Quản lý: Có quyền chọn chi nhánh qua req.query.store_id
    // - Phó ca, Trưởng ca, Nhân viên: BẮT BUỘC gán đúng assigned_store_id của tài khoản
    let effectiveStoreId = req.query.store_id ? String(req.query.store_id) : undefined;
    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        effectiveStoreId = String(user.assigned_store_id);
      }
    }

    const data = await this.service.getAllRecipes(
      {
        store_id: effectiveStoreId,
        type: type ? String(type) : undefined,
        category: category ? String(category) : undefined,
        search: search ? String(search) : undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
      },
      user?.role || null
    );

    return res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách công thức & thực đơn thành công',
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userRole = (req as any).user?.role || null;

    const data = await this.service.getRecipeById(id, userRole);

    return res.status(200).json({
      success: true,
      data,
      message: 'Lấy chi tiết công thức pha chế thành công',
    });
  });
}
