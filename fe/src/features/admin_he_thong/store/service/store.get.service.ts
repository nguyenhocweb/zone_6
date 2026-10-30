import axiosClient from '@/core/api/axios-instance';
import type { Store, StoreListResponse } from '../type/store.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getStoresService(filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<StoreListResponse> {
  const params: Record<string, any> = {};
  if (filters?.is_active !== undefined) params.is_active = filters.is_active;
  if (filters?.search) params.search = filters.search;

  const res = await axiosClient.get<ApiResponse<StoreListResponse>>('/api/v1/stores', { params });
  return res.data.data;
}

export async function getStoreByIdService(id: string): Promise<Store> {
  const res = await axiosClient.get<ApiResponse<Store>>(`/api/v1/stores/${id}`);
  return res.data.data;
}
