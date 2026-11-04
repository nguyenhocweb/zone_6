'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableService } from '../service/table.service';
import { CreateTableDto, UpdateTableDto } from '../type/table.type';
import { toast } from 'sonner';

export const TABLE_QUERY_KEY = ['admin_he_thong', 'tables'] as const;
export const TABLE_ZONES_QUERY_KEY = ['admin_he_thong', 'table_zones'] as const;

export function useTables(params?: { store_id?: string; zone_name?: string; status?: string }) {
  return useQuery({
    queryKey: [...TABLE_QUERY_KEY, params],
    queryFn: () => tableService.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useTableZones(storeId?: string | null) {
  return useQuery({
    queryKey: [...TABLE_ZONES_QUERY_KEY, storeId],
    queryFn: () => tableService.getZones(storeId || undefined),
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
}

export function useCreateTableZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { store_id: string; name: string }) => tableService.createZone(data),
    onSuccess: (newZone) => {
      toast.success(`Đã tạo tầng "${newZone.name}" thành công!`);
      queryClient.invalidateQueries({ queryKey: TABLE_ZONES_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tạo tầng');
    },
  });
}

export function useDeleteTableZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tableService.deleteZone(id),
    onSuccess: () => {
      toast.success('Đã xóa tầng thành công!');
      queryClient.invalidateQueries({ queryKey: TABLE_ZONES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi xóa tầng');
    },
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableDto) => tableService.create(data),
    onSuccess: (newTable) => {
      toast.success(`Đã thêm bàn ${newTable.table_number} (${newTable.zone_name}) thành công!`);
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tạo bàn');
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tableService.update(id, data),
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật bàn ${updated.table_number} thành công!`);
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi cập nhật bàn');
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tableService.delete(id),
    onSuccess: () => {
      toast.success('Đã xóa bàn thành công!');
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi xóa bàn');
    },
  });
}

export function useRegenerateTableToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tableService.regenerateToken(id),
    onSuccess: (updated) => {
      toast.success(`Đã tạo mã QR mới cho bàn ${updated.table_number}!`);
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tạo lại mã QR');
    },
  });
}

