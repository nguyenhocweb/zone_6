import { type Request, type Response } from 'express';
import { SellableToppingGetService } from '../services/sellable-topping.get.service.js';

export async function getSellableToppingsController(req: Request, res: Response): Promise<void> {
  const service = new SellableToppingGetService();
  const authReq = req as any;
  const user = authReq.user;
  const { is_active, search } = req.query;

  // Phân quyền chi nhánh (Store Scoping):
  // - Admin hoặc Quản lý: Có quyền chọn chi nhánh qua req.query.store_id
  // - Phó ca, Trưởng ca, Nhân viên: BẮT BUỘC gán đúng assigned_store_id của tài khoản
  let effectiveStoreId = req.query.store_id ? String(req.query.store_id) : undefined;
  if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
    if (user.assigned_store_id) {
      effectiveStoreId = String(user.assigned_store_id);
    }
  }

  const result = await service.getAll({
    is_active: is_active !== undefined ? is_active === 'true' : undefined,
    search: search ? String(search) : undefined,
    store_id: effectiveStoreId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getSellableToppingByIdController(req: Request, res: Response): Promise<void> {
  const service = new SellableToppingGetService();
  const id = req.params.id as string;

  const result = await service.getById(id);

  res.status(200).json({
    success: true,
    data: result,
  });
}
