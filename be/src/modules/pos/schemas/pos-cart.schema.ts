import { z } from 'zod';

export const ToppingItemSchema = z.object({
  name: z.string().min(1, 'Tên topping không được để trống'),
  price: z.number().min(0, 'Giá topping phải >= 0'),
});

export const OrderItemInputSchema = z.object({
  recipeId: z.string().min(1, 'Mã món không được để trống'),
  name: z.string().min(1, 'Tên món không được để trống'),
  quantity: z.number().int().min(1, 'Số lượng phải >= 1'),
  unitPrice: z.number().min(0, 'Đơn giá phải >= 0'),
  subtotal: z.number().min(0, 'Thành tiền phải >= 0'),
  toppings: z.array(ToppingItemSchema).optional().default([]),
  notes: z.string().optional().default(''),
});

export const UpdateLiveCartSchema = z.object({
  storeId: z.string().min(1, 'storeId bắt buộc'),
  shiftId: z.string().min(1, 'shiftId bắt buộc'),
  items: z.array(OrderItemInputSchema),
  tableNumber: z.string().optional().default(''),
  customerName: z.string().optional().default('Khách lẻ'),
  discount: z.number().min(0).optional().default(0),
});

export const LockCartSchema = z.object({
  storeId: z.string().min(1, 'storeId bắt buộc'),
  shiftId: z.string().min(1, 'shiftId bắt buộc'),
  isLocked: z.boolean(),
});
