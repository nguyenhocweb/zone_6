import { z } from 'zod';

export const SuppliedMaterialSchema = z.object({
  material_id: z.string().min(1, 'Mã ID vật tư không được để trống'),
  material_code: z.string().min(1, 'Mã code vật tư không được để trống'),
  material_name: z.string().min(1, 'Tên vật tư không được để trống'),
  category: z.enum(['packaging', 'ingredient', 'topping']),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  supply_price: z.coerce.number().min(0).optional().nullable(),
});

export const SupplierCreateSchema = z.object({
  code: z.string().min(1, 'Mã nhà cung cấp không được để trống').optional(),
  name: z.string().min(2, 'Tên nhà cung cấp phải từ 2 ký tự trở lên'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email không đúng định dạng').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  supplied_materials: z.array(SuppliedMaterialSchema).optional().default([]),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const SupplierUpdateSchema = SupplierCreateSchema.partial();

export type SuppliedMaterialDto = z.infer<typeof SuppliedMaterialSchema>;
export type SupplierCreateDto = z.infer<typeof SupplierCreateSchema>;
export type SupplierUpdateDto = z.infer<typeof SupplierUpdateSchema>;

export interface SupplierResponse {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  supplied_materials: SuppliedMaterialDto[];
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
