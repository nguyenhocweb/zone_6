import axiosClient from "@/core/api/axios-instance";
import type {
  PurchaseRequisition,
  SuggestionResponse,
  CreateRequisitionPayload,
  UpdateRequisitionStatusPayload,
} from "../type/requisition.type";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export async function getRequisitionsService(params?: {
  store_id?: string;
  status?: string;
  search?: string;
  priority?: string;
}): Promise<PurchaseRequisition[]> {
  const res = await axiosClient.get<ApiResponse<PurchaseRequisition[]>>(
    "/api/v1/purchase-requisitions",
    { params }
  );
  return res.data.data || [];
}

export async function getRequisitionByIdService(id: string): Promise<PurchaseRequisition> {
  const res = await axiosClient.get<ApiResponse<PurchaseRequisition>>(
    `/api/v1/purchase-requisitions/${id}`
  );
  return res.data.data;
}

export async function getRequisitionSuggestionsService(
  storeId?: string
): Promise<SuggestionResponse> {
  const res = await axiosClient.get<ApiResponse<SuggestionResponse>>(
    "/api/v1/purchase-requisitions/suggest",
    { params: storeId ? { store_id: storeId } : {} }
  );
  return res.data.data;
}

export async function createRequisitionService(
  payload: CreateRequisitionPayload
): Promise<PurchaseRequisition> {
  const res = await axiosClient.post<ApiResponse<PurchaseRequisition>>(
    "/api/v1/purchase-requisitions",
    payload
  );
  return res.data.data;
}

export async function updateRequisitionStatusService(
  id: string,
  payload: UpdateRequisitionStatusPayload
): Promise<PurchaseRequisition> {
  const res = await axiosClient.patch<ApiResponse<PurchaseRequisition>>(
    `/api/v1/purchase-requisitions/${id}/status`,
    payload
  );
  return res.data.data;
}

