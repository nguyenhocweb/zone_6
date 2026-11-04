import axiosClient from '@/core/api/axios-instance';
import type { PayOSConfig, PayOSPublicConfig } from '../type/payos.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getPayOSConfigsService(): Promise<PayOSConfig[]> {
  const res = await axiosClient.get<ApiResponse<PayOSConfig[]>>('/api/v1/payos');
  return res.data.data;
}

export async function getDefaultPayOSConfigService(): Promise<PayOSPublicConfig | null> {
  const res = await axiosClient.get<ApiResponse<PayOSPublicConfig | null>>('/api/v1/payos/default');
  return res.data.data;
}

export async function getPayOSConfigByIdService(id: string): Promise<PayOSConfig> {
  const res = await axiosClient.get<ApiResponse<PayOSConfig>>(`/api/v1/payos/${id}`);
  return res.data.data;
}

