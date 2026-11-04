import axiosClient from '@/core/api/axios-instance';
import type { PayOSConfig, CreatePayOSPayload } from '../type/payos.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function createPayOSConfigService(payload: CreatePayOSPayload): Promise<PayOSConfig> {
  const res = await axiosClient.post<ApiResponse<PayOSConfig>>('/api/v1/payos', payload);
  return res.data.data;
}

