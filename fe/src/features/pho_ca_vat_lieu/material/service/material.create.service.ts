import axiosClient from '@/core/api/axios-instance';
import type { Material, MaterialCreatePayload } from '../type/material.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function createMaterialService(payload: MaterialCreatePayload): Promise<Material> {
  const res = await axiosClient.post<ApiResponse<Material>>('/api/v1/materials', payload);
  return res.data.data;
}
