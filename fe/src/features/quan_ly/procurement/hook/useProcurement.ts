import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPurchaseOrdersService,
  getPurchaseOrderByIdService,
  previewAggregationService,
  createPoFromRequisitionsService,
  receivePoService,
} from "../service/procurement.service";
import type {
  CreatePoFromRequisitionsPayload,
  ReceivePoPayload,
} from "../type/procurement.type";
import { REQUISITION_QUERY_KEYS } from "@/features/pho_ca_vat_lieu/purchase_requisition/hook/usePurchaseRequisitions";

export const PO_QUERY_KEYS = {
  all: ["purchase_orders"] as const,
  lists: () => [...PO_QUERY_KEYS.all, "list"] as const,
  list: (params?: {
    store_id?: string;
    supplier_id?: string;
    status?: string;
    order_type?: string;
    search?: string;
  }) => [...PO_QUERY_KEYS.lists(), params] as const,
  details: () => [...PO_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PO_QUERY_KEYS.details(), id] as const,
};

export function useGetPurchaseOrders(params?: {
  store_id?: string;
  supplier_id?: string;
  status?: string;
  order_type?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.list(params),
    queryFn: () => getPurchaseOrdersService(params),
    staleTime: 30 * 1000,
  });
}

export function useGetPurchaseOrderById(id?: string) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.detail(id || ""),
    queryFn: () => getPurchaseOrderByIdService(id!),
    enabled: Boolean(id),
  });
}

export function usePreviewAggregation() {
  return useMutation({
    mutationFn: (requisitionIds: string[]) => previewAggregationService(requisitionIds),
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể tổng hợp ma trận gộp đơn PO";
      toast.error(msg);
    },
  });
}

export function useCreatePoFromRequisitions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePoFromRequisitionsPayload) =>
      createPoFromRequisitionsService(payload),
    onSuccess: (data) => {
      toast.success(`Đã tạo thành công ${data.total_pos_created} đơn thu mua PO!`);
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể tạo đơn thu mua PO";
      toast.error(msg);
    },
  });
}

export function useReceivePo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReceivePoPayload }) =>
      receivePoService(id, payload),
    onSuccess: (data) => {
      toast.success(`Đã xác nhận nhập kho đơn hàng "${data.po_number}" thành công!`);
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể xác nhận nhập kho";
      toast.error(msg);
    },
  });
}

