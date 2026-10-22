import type { Request, Response, NextFunction } from 'express';
import { ZaloService } from '../services/zalo.service.js';
import type { SendImageMessageDto, SendTextMessageDto } from '../schemas/zalo.schema.js';

export class ZaloController {
  constructor(private service: ZaloService) {}

  startQr = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.startQrLogin();
      res.status(202).json({
        success: true,
        message: 'Đã tạo phiên quét mã QR thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getQrStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = this.service.getQrStatus(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelQr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = this.service.cancelQrLogin(id);
      res.status(200).json({
        success: true,
        message: 'Đã hủy phiên QR',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getStatus();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getGroups = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getGroups();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  sendText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: SendTextMessageDto = req.body;
      const result = await this.service.sendTextMessage(dto);
      res.status(200).json({
        success: true,
        message: 'Gửi tin nhắn Zalo thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  sendImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: SendImageMessageDto = req.body;
      const result = await this.service.sendImageMessage(dto);
      res.status(200).json({
        success: true,
        message: 'Gửi hình ảnh Zalo thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.logout();
      res.status(200).json({
        success: true,
        message: 'Đăng xuất tài khoản Zalo thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
