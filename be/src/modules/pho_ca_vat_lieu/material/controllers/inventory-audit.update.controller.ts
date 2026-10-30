import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { InventoryAuditUpdateService } from '../services/inventory-audit.update.service.js';
import { InventoryAuditUpdateSchema } from '../schemas/inventory-audit.schema.js';

export class InventoryAuditUpdateController {
  constructor(private service: InventoryAuditUpdateService = new InventoryAuditUpdateService()) {}

  update = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const id = String(req.params.id);

    const validated = InventoryAuditUpdateSchema.parse(req.body);

    const reviewerInfo = {
      id: user?._id || user?.id || user?.userId || 'unknown',
      name: user?.full_name || user?.name || user?.username || 'Phó ca / Quản lý',
      role: user?.role || 'pho_ca_vat_lieu',
    };

    const data = await this.service.updateAudit(id, validated, reviewerInfo);

    return res.status(200).json({
      success: true,
      data,
      message: validated.apply_to_stock
        ? `Đã cập nhật phiếu kiểm kho và đồng bộ tồn kho thành công`
        : `Chỉnh sửa phiếu kiểm kho thành công`,
    });
  });
}
