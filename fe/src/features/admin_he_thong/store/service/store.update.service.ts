import axiosClient from '@/core/api/axios-instance';
import type { Store, StoreUpdatePayload } from '../type/store.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function updateStoreService(id: string, payload: StoreUpdatePayload): Promise<Store> {
  const res = await axiosClient.put<ApiResponse<Store>>(`/api/v1/stores/${id}`, payload);
  return res.data.data;
}
