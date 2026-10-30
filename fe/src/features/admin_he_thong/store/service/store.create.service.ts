import axiosClient from '@/core/api/axios-instance';
import type { Store, StoreCreatePayload } from '../type/store.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function createStoreService(payload: StoreCreatePayload): Promise<Store> {
  const res = await axiosClient.post<ApiResponse<Store>>('/api/v1/stores', payload);
  return res.data.data;
}
