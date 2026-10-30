import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import {
  getInventoryAuditsService,
  getInventoryAuditByIdService,
  createInventoryAuditService,
  updateInventoryAuditService,
  getInventoryAuditConfigService,
  updateInventoryAuditConfigService,
} from '../service/inventory-audit.service';
import type {
  InventoryAudit,
  InventoryAuditCreatePayload,
  InventoryAuditUpdatePayload,
  InventoryAuditConfig,
  InventoryAuditConfigUpdatePayload,
} from '../type/inventory-audit.type';
import { toast } from 'sonner';

export function useGetInventoryAudits(params?: { store_id?: string; status?: string; date?: string }) {
  return useQuery<InventoryAudit[]>({
    queryKey: queryKeys.inventoryAudits.list(params),
    queryFn: () => getInventoryAuditsService(params),
    staleTime: 60 * 1000,
  });
}

export function useGetInventoryAuditDetail(id: string | null) {
  return useQuery<InventoryAudit>({
    queryKey: queryKeys.inventoryAudits.detail(id || ''),
    queryFn: () => getInventoryAuditByIdService(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateInventoryAudit() {
  const queryClient = useQueryClient();

  return useMutation<InventoryAudit, Error, InventoryAuditCreatePayload>({
    mutationFn: (payload) => createInventoryAuditService(payload),
    onSuccess: (data) => {
      toast.success(`Đã nộp phiếu kiểm kho "${data.audit_code}" thành công!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryAudits.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi nộp phiếu kiểm kho';
      toast.error(msg);
    },
  });
}

export function useUpdateInventoryAudit() {
  const queryClient = useQueryClient();

  return useMutation<InventoryAudit, Error, { id: string; payload: InventoryAuditUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateInventoryAuditService(id, payload),
    onSuccess: (data, variables) => {
      if (variables.payload.apply_to_stock) {
        toast.success(`Đã lưu chỉnh sửa và đồng bộ tồn kho thực tế thành công!`);
        queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      } else {
        toast.success(`Đã cập nhật phiếu kiểm kho "${data.audit_code}" thành công!`);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryAudits.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật phiếu kiểm kho';
      toast.error(msg);
    },
  });
}

export function useGetInventoryAuditConfig(storeId?: string | null) {
  return useQuery<InventoryAuditConfig>({
    queryKey: queryKeys.inventoryAudits.config(storeId),
    queryFn: () => getInventoryAuditConfigService(storeId),
    staleTime: 60 * 1000,
  });
}

export function useUpdateInventoryAuditConfig() {
  const queryClient = useQueryClient();

  return useMutation<InventoryAuditConfig, Error, InventoryAuditConfigUpdatePayload>({
    mutationFn: (payload) => updateInventoryAuditConfigService(payload),
    onSuccess: (data) => {
      toast.success('Đã lưu cấu hình phân quyền & lịch kiểm kho thành công!');
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryAudits.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu cấu hình kiểm kho';
      toast.error(msg);
    },
  });
}
