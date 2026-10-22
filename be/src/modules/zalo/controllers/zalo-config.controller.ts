import type { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { ZaloConfigService } from '../services/zalo-config.service.js';
import type { UpdateZaloConfigDto } from '../schemas/zalo.schema.js';

export class ZaloConfigController {
  constructor(private service: ZaloConfigService = new ZaloConfigService()) {}

  getConfig = asyncHandler(async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const config = await this.service.getConfig();
    res.status(200).json({
      success: true,
      message: 'Lấy cấu hình Zalo thành công',
      data: config,
    });
  });

  updateConfig = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const dto: UpdateZaloConfigDto = req.body;
    const updated = await this.service.updateConfig(dto);
    res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình Zalo thành công',
      data: updated,
    });
  });
}
