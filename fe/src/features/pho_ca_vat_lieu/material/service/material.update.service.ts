import axiosClient from '@/core/api/axios-instance';
import type { Material, MaterialStockUpdatePayload, MaterialUpdatePayload } from '../type/material.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function updateMaterialService(
  id: string,
  payload: MaterialUpdatePayload
): Promise<Material> {
  const res = await axiosClient.put<ApiResponse<Material>>(`/api/v1/materials/${id}`, payload);
  return res.data.data;
}

export async function updateMaterialStockService(
  id: string,
  payload: MaterialStockUpdatePayload
): Promise<Material> {
  const res = await axiosClient.patch<ApiResponse<Material>>(
    `/api/v1/materials/${id}/stock`,
    payload
  );
  return res.data.data;
}
