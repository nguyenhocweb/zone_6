import { z } from 'zod';

export const AggregatePreviewSchema = z.object({
  requisition_ids: z.array(z.string()).min(1, 'Cần chọn ít nhất 1 phiếu yêu cầu để gom đơn'),
});

export const PoCustomItemSchema = z.object({
  requisition_id: z.string().optional().nullable(),
  target_store_id: z.string().min(1, 'Target Store ID là bắt buộc'),
  target_store_name: z.string(),
  material_id: z.string().min(1, 'Material ID là bắt buộc'),
  material_code: z.string(),
  material_name: z.string(),
  category: z.string(),
  unit: z.string(),
  ordered_quantity: z.number().positive('Số lượng đặt phải lớn hơn 0'),
  unit_price: z.number().min(0).default(0),
});

export const CreatePoFromRequisitionsSchema = z.object({
  requisition_ids: z.array(z.string()).min(1, 'Cần chọn ít nhất 1 phiếu yêu cầu'),
  order_type: z.enum(['CONSOLIDATED', 'BRANCH_DIRECT']),
  delivery_destination: z.enum(['CENTRAL_HUB', 'STORE_DIRECT']),
  delivery_store_id: z.string().nullable().optional(),
  delivery_address: z.string().min(1, 'Địa chỉ giao hàng là bắt buộc'),
  contact_person: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  expected_arrival_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  // Cho phép Quản lý tùy biến phân nhóm và số lượng
  groups: z
    .array(
      z.object({
        supplier_id: z.string().min(1, 'Supplier ID là bắt buộc'),
        supplier_name: z.string(),
        delivery_address: z.string().optional(),
        delivery_store_id: z.string().optional().nullable(),
        items: z.array(PoCustomItemSchema).min(1, 'Mỗi đơn PO phải có ít nhất 1 mặt hàng'),
      })
    )
    .optional(),
});

export const ReceivePoSchema = z.object({
  notes: z.string().nullable().optional(),
  received_items: z
    .array(
      z.object({
        material_id: z.string().min(1, 'Material ID là bắt buộc'),
        target_store_id: z.string().min(1, 'Store ID là bắt buộc'),
        category: z.string(),
        received_quantity: z.number().min(0, 'Số lượng nhận không được âm'),
      })
    )
    .min(1, 'Phải có ít nhất 1 mặt hàng nhận kho'),
});

export type AggregatePreviewDto = z.infer<typeof AggregatePreviewSchema>;
export type CreatePoFromRequisitionsDto = z.infer<typeof CreatePoFromRequisitionsSchema>;
export type ReceivePoDto = z.infer<typeof ReceivePoSchema>;

