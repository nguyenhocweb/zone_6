import axiosClient from "@/core/api/axios-instance";
import type {
  PurchaseOrder,
  AggregatePreviewResponse,
  CreatePoFromRequisitionsPayload,
  ReceivePoPayload,
} from "../type/procurement.type";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export async function getPurchaseOrdersService(params?: {
  store_id?: string;
  supplier_id?: string;
  status?: string;
  order_type?: string;
  search?: string;
}): Promise<PurchaseOrder[]> {
  const res = await axiosClient.get<ApiResponse<PurchaseOrder[]>>("/api/v1/purchase-orders", {
    params,
  });
  return res.data.data || [];
}

export async function getPurchaseOrderByIdService(id: string): Promise<PurchaseOrder> {
  const res = await axiosClient.get<ApiResponse<PurchaseOrder>>(`/api/v1/purchase-orders/${id}`);
  return res.data.data;
}

export async function previewAggregationService(
  requisitionIds: string[]
): Promise<AggregatePreviewResponse> {
  const res = await axiosClient.post<ApiResponse<AggregatePreviewResponse>>(
    "/api/v1/purchase-orders/aggregate-preview",
    { requisition_ids: requisitionIds }
  );
  return res.data.data;
}

export async function createPoFromRequisitionsService(
  payload: CreatePoFromRequisitionsPayload
): Promise<{ total_pos_created: number; orders: PurchaseOrder[] }> {
  const res = await axiosClient.post<ApiResponse<{ total_pos_created: number; orders: PurchaseOrder[] }>>(
    "/api/v1/purchase-orders/create-from-requisitions",
    payload
  );
  return res.data.data;
}

export async function receivePoService(
  id: string,
  payload: ReceivePoPayload
): Promise<PurchaseOrder> {
  const res = await axiosClient.post<ApiResponse<PurchaseOrder>>(
    `/api/v1/purchase-orders/${id}/receive`,
    payload
  );
  return res.data.data;
}

