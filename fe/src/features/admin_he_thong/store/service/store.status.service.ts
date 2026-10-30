import axiosClient from '@/core/api/axios-instance';
import type { Store, StoreStatusPayload } from '../type/store.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function toggleStoreStatusService(
  id: string,
  payload: StoreStatusPayload
): Promise<{ store: Store; message: string }> {
  const res = await axiosClient.patch<ApiResponse<Store>>(`/api/v1/stores/${id}/status`, payload);
  return {
    store: res.data.data,
    message: res.data.message,
  };
}
