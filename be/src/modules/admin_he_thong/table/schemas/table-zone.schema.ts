import { z } from 'zod';

export const CreateTableZoneSchema = z.object({
  store_id: z.string().min(1, 'store_id không được để trống'),
  name: z.string().min(1, 'Tên tầng/khu vực không được để trống').trim(),
});

export interface CreateTableZoneDto {
  store_id: string;
  name: string;
}
