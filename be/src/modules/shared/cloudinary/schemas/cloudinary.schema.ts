import { z } from 'zod';

export const CloudinarySignSchema = z.object({
  item_id: z.string().trim().optional(),
  folder: z.string().trim().optional(),
});

export type CloudinarySignDto = z.infer<typeof CloudinarySignSchema>;

export interface CloudinarySignResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  item_id: string;
}
