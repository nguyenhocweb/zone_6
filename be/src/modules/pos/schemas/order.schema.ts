import { z } from 'zod';
import { OrderItemInputSchema } from './pos-cart.schema.js';

export const CheckoutOrderSchema = z.object({
  storeId: z.string().min(1, 'storeId bắt buộc'),
  shiftId: z.string().optional(),
  tableNumber: z.string().optional().default(''),
  customerName: z.string().optional().default('Khách lẻ'),
  items: z.array(OrderItemInputSchema).min(1, 'Đơn hàng phải có ít nhất 1 món'),
  totalAmount: z.number().min(0, 'Tổng tiền phải >= 0'),
  discountAmount: z.number().min(0).optional().default(0),
  finalAmount: z.number().min(0, 'Số tiền thanh toán phải >= 0'),
  paymentMethod: z.enum(['VIETQR', 'CASH', 'CARD']).default('VIETQR'),
  paymentStatus: z.enum(['PENDING', 'COMPLETED']).optional(),
  sessionCode: z.string().optional(),
});

export const VerifyShiftQuerySchema = z.object({
  storeId: z.string().optional(),
});

