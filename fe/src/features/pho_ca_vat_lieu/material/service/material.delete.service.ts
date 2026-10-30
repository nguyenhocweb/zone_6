import axiosClient from '@/core/api/axios-instance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function deleteMaterialService(id: string): Promise<{ success: boolean; message: string }> {
  const res = await axiosClient.delete<ApiResponse<null>>(`/api/v1/materials/${id}`);
  return {
    success: res.data.success,
    message: res.data.message,
  };
}
