import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/core/constants/query-keys';
import {
  getShiftConfigsService,
  createShiftConfigService,
  updateShiftConfigService,
  deleteShiftConfigService,
  resetShiftConfigsService,
} from '../service/shift-config.service';
import type {
  ShiftConfigCreatePayload,
  ShiftConfigUpdatePayload,
} from '../type/shift-config.type';

export function useGetShiftConfigs(storeId?: string | null) {
  return useQuery({
    queryKey: queryKeys.shiftConfigs.list(storeId),
    queryFn: () => getShiftConfigsService(storeId),
    staleTime: 60 * 1000,
  });
}

export function useCreateShiftConfig(storeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShiftConfigCreatePayload) => createShiftConfigService(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shiftConfigs.all });
      toast.success(`Đã thêm ca làm việc '${data.shift_name}' thành công!`);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Không thể tạo ca làm việc mới';
      toast.error(msg);
    },
  });
}

export function useUpdateShiftConfig(storeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ShiftConfigUpdatePayload }) =>
      updateShiftConfigService(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shiftConfigs.all });
      toast.success(`Đã cập nhật ca làm việc '${data.shift_name}' thành công!`);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Không thể cập nhật ca làm việc';
      toast.error(msg);
    },
  });
}

export function useDeleteShiftConfig(storeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShiftConfigService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shiftConfigs.all });
      toast.success('Đã xóa ca làm việc thành công!');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Không thể xóa ca làm việc';
      toast.error(msg);
    },
  });
}

export function useResetShiftConfigs(storeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetShiftConfigsService(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shiftConfigs.all });
      toast.success('Đã khôi phục danh sách ca làm việc chuẩn Zone Six thành công!');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Không thể khôi phục ca làm việc mặc định';
      toast.error(msg);
    },
  });
}
