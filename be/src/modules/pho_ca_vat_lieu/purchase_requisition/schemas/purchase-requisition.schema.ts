import { z } from 'zod';

export const RequisitionItemInputSchema = z.object({
  material_id: z.string().min(1, 'Material ID là bắt buộc'),
  material_code: z.string().min(1, 'Mã nguyên liệu là bắt buộc'),
  material_name: z.string().min(1, 'Tên nguyên liệu là bắt buộc'),
  category: z.string().min(1, 'Phân loại là bắt buộc'),
  unit: z.string().min(1, 'Đơn vị tính là bắt buộc'),
  current_stock: z.number().default(0),
  min_threshold: z.number().default(0),
  requested_quantity: z.number().positive('Số lượng yêu cầu phải lớn hơn 0'),
  suggested_supplier_id: z.string().nullable().optional(),
  suggested_supplier_name: z.string().nullable().optional(),
});

export const CreateRequisitionSchema = z.object({
  store_id: z.string().optional(),
  priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
  expected_delivery_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(RequisitionItemInputSchema).min(1, 'Phải có ít nhất 1 mặt hàng trong phiếu yêu cầu'),
});

export const UpdateRequisitionStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
  rejection_reason: z.string().nullable().optional(),
  approved_items: z
    .array(
      z.object({
        material_id: z.string(),
        approved_quantity: z.number().min(0),
      })
    )
    .optional(),
});

export type CreateRequisitionDto = z.infer<typeof CreateRequisitionSchema>;
export type UpdateRequisitionStatusDto = z.infer<typeof UpdateRequisitionStatusSchema>;

