import axiosClient from '@/core/api/axios-instance';
import type {
  ShiftConfigItem,
  ShiftConfigListResponse,
  ShiftConfigCreatePayload,
  ShiftConfigUpdatePayload,
} from '../type/shift-config.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getShiftConfigsService(storeId?: string | null): Promise<ShiftConfigListResponse> {
  const res = await axiosClient.get<ApiResponse<ShiftConfigListResponse>>('/api/v1/scheduling/shift-configs', {
    params: storeId ? { store_id: storeId } : {},
  });
  return res.data.data;
}

export async function createShiftConfigService(payload: ShiftConfigCreatePayload): Promise<ShiftConfigItem> {
  const res = await axiosClient.post<ApiResponse<ShiftConfigItem>>('/api/v1/scheduling/shift-configs', payload);
  return res.data.data;
}

export async function updateShiftConfigService(
  id: string,
  payload: ShiftConfigUpdatePayload
): Promise<ShiftConfigItem> {
  const res = await axiosClient.put<ApiResponse<ShiftConfigItem>>(
    `/api/v1/scheduling/shift-configs/${id}`,
    payload
  );
  return res.data.data;
}

export async function deleteShiftConfigService(id: string): Promise<boolean> {
  const res = await axiosClient.delete<ApiResponse<unknown>>(`/api/v1/scheduling/shift-configs/${id}`);
  return res.data.success;
}

export async function resetShiftConfigsService(storeId?: string | null): Promise<ShiftConfigItem[]> {
  const res = await axiosClient.post<ApiResponse<ShiftConfigItem[]>>(
    '/api/v1/scheduling/shift-configs/reset-defaults',
    { store_id: storeId || null }
  );
  return res.data.data;
}
