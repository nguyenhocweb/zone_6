import axiosClient from '@/core/api/axios-instance';
import type { PayOSConfig, UpdatePayOSPayload } from '../type/payos.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function updatePayOSConfigService(
  id: string,
  payload: UpdatePayOSPayload
): Promise<PayOSConfig> {
  const res = await axiosClient.put<ApiResponse<PayOSConfig>>(`/api/v1/payos/${id}`, payload);
  return res.data.data;
}

