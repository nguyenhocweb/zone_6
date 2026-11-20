import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSWebhookService } from '../services/payos-webhook.service.js';

const webhookService = new PayOSWebhookService();

export const payOSWebhookController = asyncHandler(async (req: Request, res: Response) => {
  const result = await webhookService.handleWebhook(req.body);
  // PayOS yêu cầu phản hồi HTTP 200 nhanh chóng để không retry
  res.status(200).json(result);
});

export const payOSSimulatePaymentController = asyncHandler(async (req: Request, res: Response) => {
  const { orderCode, amount } = req.body;
  const result = await webhookService.simulatePayment(orderCode, amount);
  res.status(200).json({ success: true, message: 'Đã kích hoạt thanh toán thành công qua WebSocket', data: result });
});
