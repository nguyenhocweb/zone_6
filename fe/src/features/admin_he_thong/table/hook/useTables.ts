'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableService } from '../service/table.service';
import { CreateTableDto, UpdateTableDto } from '../type/table.type';
import { toast } from 'sonner';

export const TABLE_QUERY_KEY = ['admin_he_thong', 'tables'] as const;

export function useTables(params?: { store_id?: string; zone_name?: string; status?: string }) {
  return useQuery({
    queryKey: [...TABLE_QUERY_KEY, params],
    queryFn: () => tableService.getAll(params),
    staleTime: 30 * 1000,
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

