import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { MaterialGetService } from '../services/material.get.service.js';

export class MaterialGetController {
  constructor(private service: MaterialGetService = new MaterialGetService()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const { category, search, is_active } = req.query;

    // Phân quyền chi nhánh (Store Scoping):
    // - Admin hoặc Quản lý: Có quyền chọn chi nhánh qua req.query.store_id
    // - Phó ca, Trưởng ca, Nhân viên: BẮT BUỘC gán đúng assigned_store_id của tài khoản
    let effectiveStoreId = req.query.store_id ? String(req.query.store_id) : undefined;
    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        effectiveStoreId = String(user.assigned_store_id);
      }
    }

    const data = await this.service.getAllMaterials({
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      store_id: effectiveStoreId,
    });

    return res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách nguyên vật liệu thành công',
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await this.service.getMaterialById(id);

    return res.status(200).json({
      success: true,
      data,
      message: 'Lấy thông tin vật liệu thành công',
    });
  });
}
