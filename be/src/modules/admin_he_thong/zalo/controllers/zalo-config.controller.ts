import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { ZaloConfigService } from '../services/zalo-config.service.js';

export class ZaloConfigController {
  constructor(private service: ZaloConfigService = new ZaloConfigService()) {}

  getConfig = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const storeId = (req.query.store_id || req.query.storeId) as string | undefined;
    const storeShortName = (req.query.store_short_name || req.query.storeShortName || 'CS') as string;

    const channels = await this.service.getStoreChannels(storeId, storeShortName);
    res.status(200).json({
      success: true,
      message: 'Lấy cấu hình các kênh Zalo theo cơ sở thành công',
      data: channels,
    });
  });

  updateConfig = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.body && Array.isArray(req.body.channels)) {
      const updatedList = await this.service.updateStoreChannels(req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật cấu hình toàn bộ các kênh Zalo của cơ sở thành công',
        data: updatedList,
      });
      return;
    }

    const updated = await this.service.updateSingleChannel(req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình kênh Zalo thành công',
      data: updated,
    });
  });
}

