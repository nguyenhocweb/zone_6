import axiosClient from '@/core/api/axios-instance';
import type { TestPayOSPayload, TestPayOSResult } from '../type/payos.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function testPayOSConfigService(payload: TestPayOSPayload): Promise<TestPayOSResult> {
  const res = await axiosClient.post<ApiResponse<TestPayOSResult>>('/api/v1/payos/test', payload);
  return res.data.data;
}

