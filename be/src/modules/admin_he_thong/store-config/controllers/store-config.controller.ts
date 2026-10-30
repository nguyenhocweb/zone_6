import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { StoreConfigService } from '../services/store-config.service.js';

export class StoreConfigController {
  constructor(private service: StoreConfigService = new StoreConfigService()) {}

  getConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = await this.service.getConfig();
    return res.status(200).json({
      success: true,
      data: config,
      message: 'Lấy cấu hình check-in thành công',
    });
  });

  updateConfig = asyncHandler(async (req: Request, res: Response) => {
    const actorRole = (req as any).user?.role || 'admin_he_thong';
    const updated = await this.service.updateConfig(actorRole, req.body);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Cập nhật cấu hình check-in & định vị quán thành công!',
    });
  });

  verifyLocation = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    const result = await this.service.verifyUserLocation(
      Number(latitude),
      Number(longitude)
    );
    return res.status(200).json({
      success: true,
      data: result,
      message: result.message,
    });
  });

  reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { lat, lon } = req.query;
    if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
      return res.status(400).json({
        success: false,
        message: 'Tọa độ lat, lon không hợp lệ',
      });
    }

    const result = await this.service.reverseGeocode(Number(lat), Number(lon));
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Giải mã tọa độ thành địa chỉ thành công',
    });
  });
}
