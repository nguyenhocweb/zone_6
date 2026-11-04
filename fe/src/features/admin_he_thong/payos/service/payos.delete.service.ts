import axiosClient from '@/core/api/axios-instance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function deletePayOSConfigService(id: string): Promise<boolean> {
  const res = await axiosClient.delete<ApiResponse<boolean>>(`/api/v1/payos/${id}`);
  return res.data.data;
}

