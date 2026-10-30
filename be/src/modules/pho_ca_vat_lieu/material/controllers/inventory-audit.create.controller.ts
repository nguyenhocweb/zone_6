import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { InventoryAuditCreateService } from '../services/inventory-audit.create.service.js';
import { InventoryAuditCreateSchema } from '../schemas/inventory-audit.schema.js';

export class InventoryAuditCreateController {
  constructor(private service: InventoryAuditCreateService = new InventoryAuditCreateService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const body = { ...req.body };

    // Tự động gán cơ sở nếu người dùng bị ràng buộc cố định
    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        body.store_id = String(user.assigned_store_id);
      }
    }

    const validated = InventoryAuditCreateSchema.parse(body);

    const creatorInfo = {
      id: user?._id || user?.id || user?.userId || 'unknown',
      name: user?.full_name || user?.name || user?.username || 'Nhân viên',
      role: user?.role || 'nhan_vien',
    };

    const data = await this.service.createAudit(validated, creatorInfo);

    return res.status(201).json({
      success: true,
      data,
      message: `Tạo phiếu kiểm kho "${data.audit_code}" thành công`,
    });
  });
}
