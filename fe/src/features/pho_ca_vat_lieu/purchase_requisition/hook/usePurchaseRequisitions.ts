import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRequisitionsService,
  getRequisitionByIdService,
  getRequisitionSuggestionsService,
  createRequisitionService,
  updateRequisitionStatusService,
} from "../service/requisition.service";
import type {
  CreateRequisitionPayload,
  UpdateRequisitionStatusPayload,
} from "../type/requisition.type";

export const REQUISITION_QUERY_KEYS = {
  all: ["purchase_requisitions"] as const,
  lists: () => [...REQUISITION_QUERY_KEYS.all, "list"] as const,
  list: (params?: { store_id?: string; status?: string; search?: string; priority?: string }) =>
    [...REQUISITION_QUERY_KEYS.lists(), params] as const,
  details: () => [...REQUISITION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...REQUISITION_QUERY_KEYS.details(), id] as const,
  suggestions: (storeId?: string) =>
    [...REQUISITION_QUERY_KEYS.all, "suggestions", storeId] as const,
};

export function useGetRequisitions(params?: {
  store_id?: string;
  status?: string;
  search?: string;
  priority?: string;
}) {
  return useQuery({
    queryKey: REQUISITION_QUERY_KEYS.list(params),
    queryFn: () => getRequisitionsService(params),
    staleTime: 30 * 1000,
  });
}

export function useGetRequisitionById(id?: string) {
  return useQuery({
    queryKey: REQUISITION_QUERY_KEYS.detail(id || ""),
    queryFn: () => getRequisitionByIdService(id!),
    enabled: Boolean(id),
  });
}

export function useGetRequisitionSuggestions(storeId?: string, enabled = true) {
  return useQuery({
    queryKey: REQUISITION_QUERY_KEYS.suggestions(storeId),
    queryFn: () => getRequisitionSuggestionsService(storeId),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequisitionPayload) => createRequisitionService(payload),
    onSuccess: (data) => {
      toast.success(`Đã tạo phiếu yêu cầu "${data.code}" thành công!`);
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể tạo phiếu yêu cầu nhập kho";
      toast.error(msg);
    },
  });
}

export function useUpdateRequisitionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRequisitionStatusPayload }) =>
      updateRequisitionStatusService(id, payload),
    onSuccess: (data) => {
      toast.success(`Cập nhật trạng thái phiếu "${data.code}" thành công!`);
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể cập nhật trạng thái phiếu yêu cầu";
      toast.error(msg);
    },
  });
}

