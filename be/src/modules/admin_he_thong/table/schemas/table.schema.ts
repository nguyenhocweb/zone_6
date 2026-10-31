import { z } from 'zod';

export const CreateTableSchema = z.object({
  store_id: z.string().min(1, 'store_id không được để trống'),
  table_number: z.string().min(1, 'Số bàn không được để trống').trim(),
  zone_name: z.string().trim().default('Sảnh Chính'),
  capacity: z.number().int().min(1).default(4),
});

export interface CreateTableDto {
  store_id: string;
  table_number: string;
  zone_name: string;
  capacity: number;
}

export const UpdateTableSchema = z.object({
  table_number: z.string().min(1).trim().optional(),
  zone_name: z.string().trim().optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']).optional(),
  is_active: z.boolean().optional(),
});

export interface UpdateTableDto {
  table_number?: string;
  zone_name?: string;
  capacity?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  is_active?: boolean;
}
