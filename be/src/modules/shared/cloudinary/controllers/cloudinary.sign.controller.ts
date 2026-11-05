import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { CloudinarySignService } from '../services/cloudinary.sign.service.js';

export class CloudinarySignController {
  constructor(private service: CloudinarySignService = new CloudinarySignService()) {}

  signMenuUpload = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.generateMenuSignature(req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Tạo chữ ký Cloudinary cho món ăn thành công',
    });
  });
}
