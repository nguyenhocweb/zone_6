import axiosClient from '@/core/api/axios-instance';
import type { Material, MaterialListResponse } from '../type/material.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getMaterialsService(params?: {
  store_id?: string;
  category?: string;
  search?: string;
  is_active?: boolean;
  limit?: number;
  page?: number;
}): Promise<MaterialListResponse> {
  const res = await axiosClient.get<ApiResponse<MaterialListResponse>>('/api/v1/materials', {
    params,
  });
  return res.data.data;
}

export async function getMaterialByIdService(id: string): Promise<Material> {
  const res = await axiosClient.get<ApiResponse<Material>>(`/api/v1/materials/${id}`);
  return res.data.data;
}
