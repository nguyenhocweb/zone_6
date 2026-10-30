import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import {
  getSuppliersService,
  getSupplierByIdService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
} from '../service/supplier.service';
import type {
  Supplier,
  SupplierCreatePayload,
  SupplierUpdatePayload,
} from '../type/supplier.type';
import { toast } from 'sonner';

export function useGetSuppliers(params?: { search?: string; is_active?: boolean }) {
  return useQuery<Supplier[]>({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => getSuppliersService(params),
    staleTime: 60 * 1000,
  });
}

export function useGetSupplierDetail(id: string | null) {
  return useQuery<Supplier>({
    queryKey: queryKeys.suppliers.detail(id || ''),
    queryFn: () => getSupplierByIdService(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation<Supplier, Error, SupplierCreatePayload>({
    mutationFn: (payload) => createSupplierService(payload),
    onSuccess: (data) => {
      toast.success(`Đã thêm nhà cung cấp "${data.name}"!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi thêm nhà cung cấp';
      toast.error(msg);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation<Supplier, Error, { id: string; payload: SupplierUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateSupplierService(id, payload),
    onSuccess: (data) => {
      toast.success(`Cập nhật nhà cung cấp "${data.name}" thành công!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật nhà cung cấp';
      toast.error(msg);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; message: string }, Error, string>({
    mutationFn: (id) => deleteSupplierService(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã xóa nhà cung cấp!');
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa nhà cung cấp';
      toast.error(msg);
    },
  });
}
