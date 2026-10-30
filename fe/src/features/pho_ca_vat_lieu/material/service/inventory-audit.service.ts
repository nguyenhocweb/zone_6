import axiosClient from '@/core/api/axios-instance';
import type {
  InventoryAudit,
  InventoryAuditCreatePayload,
  InventoryAuditUpdatePayload,
  InventoryAuditConfig,
  InventoryAuditConfigUpdatePayload,
} from '../type/inventory-audit.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getInventoryAuditsService(params?: {
  store_id?: string;
  status?: string;
  date?: string;
}): Promise<InventoryAudit[]> {
  const res = await axiosClient.get<ApiResponse<InventoryAudit[]>>('/api/v1/inventory-audits', {
    params,
  });
  return res.data.data;
}

export async function getInventoryAuditByIdService(id: string): Promise<InventoryAudit> {
  const res = await axiosClient.get<ApiResponse<InventoryAudit>>(`/api/v1/inventory-audits/${id}`);
  return res.data.data;
}

export async function createInventoryAuditService(
  payload: InventoryAuditCreatePayload
): Promise<InventoryAudit> {
  const res = await axiosClient.post<ApiResponse<InventoryAudit>>('/api/v1/inventory-audits', payload);
  return res.data.data;
}

export async function updateInventoryAuditService(
  id: string,
  payload: InventoryAuditUpdatePayload
): Promise<InventoryAudit> {
  const res = await axiosClient.put<ApiResponse<InventoryAudit>>(
    `/api/v1/inventory-audits/${id}`,
    payload
  );
  return res.data.data;
}

export async function getInventoryAuditConfigService(
  storeId?: string | null
): Promise<InventoryAuditConfig> {
  const res = await axiosClient.get<ApiResponse<InventoryAuditConfig>>(
    '/api/v1/inventory-audits/config',
    {
      params: storeId ? { store_id: storeId } : undefined,
    }
  );
  return res.data.data;
}

export async function updateInventoryAuditConfigService(
  payload: InventoryAuditConfigUpdatePayload
): Promise<InventoryAuditConfig> {
  const res = await axiosClient.put<ApiResponse<InventoryAuditConfig>>(
    '/api/v1/inventory-audits/config',
    payload
  );
  return res.data.data;
}
