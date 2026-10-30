import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { InventoryAuditConfigUpdateService } from '../services/inventory-audit-config.update.service.js';
import { InventoryAuditConfigUpdateSchema } from '../schemas/inventory-audit.schema.js';
import { ForbiddenError } from '../../../../core/errors.js';

export class InventoryAuditConfigUpdateController {
  constructor(
    private service: InventoryAuditConfigUpdateService = new InventoryAuditConfigUpdateService()
  ) {}

  updateConfig = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;

    const validatedBody = InventoryAuditConfigUpdateSchema.parse(req.body);

    // Kiểm tra phạm vi cơ sở nếu là Phó Ca Vật Liệu
    if (user && user.role === 'pho_ca_vat_lieu') {
      if (
        user.assigned_store_id &&
        validatedBody.store_id &&
        String(user.assigned_store_id) !== String(validatedBody.store_id)
      ) {
        throw new ForbiddenError(
          'Phó Ca Vật Liệu chỉ được quyền điều chỉnh cấu hình kiểm kho tại cơ sở của mình!'
        );
      }
    }

    const updater = {
      id: user?.id || user?._id || '',
      name: user?.name || user?.full_name || 'Quản lý',
      role: user?.role || 'quan_ly',
    };

    const data = await this.service.updateConfig(validatedBody, updater);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình kiểm kho thành công',
      data,
    });
  });
}
