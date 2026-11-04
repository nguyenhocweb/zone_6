import axiosClient from '@/core/api/axios-instance';
import type { PayOSConfig } from '../type/payos.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function setDefaultPayOSConfigService(id: string): Promise<PayOSConfig> {
  const res = await axiosClient.patch<ApiResponse<PayOSConfig>>(`/api/v1/payos/${id}/set-default`);
  return res.data.data;
}

