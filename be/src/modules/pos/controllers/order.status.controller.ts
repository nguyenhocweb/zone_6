import { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { OrderStatusService } from '../services/order.status.service.js';

const statusService = new OrderStatusService();

export const getOrderStatusController = asyncHandler(async (req: Request, res: Response) => {
  const orderCode = String(req.params.orderCode || '');
  const result = await statusService.getStatusByCode(orderCode);
  res.status(200).json({ success: true, data: result });
});

export const cancelOrderController = asyncHandler(async (req: Request, res: Response) => {
  const orderId = String(req.params.orderId || '');
  const { sessionCode } = req.body;
  const result = await statusService.cancelOrder(orderId, sessionCode);
  res.status(200).json({ success: true, message: 'Đã hủy đơn hàng chờ thanh toán', data: result });
});
