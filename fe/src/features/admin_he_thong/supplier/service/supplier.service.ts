import axiosClient from '@/core/api/axios-instance';
import type {
  Supplier,
  SupplierCreatePayload,
  SupplierUpdatePayload,
} from '../type/supplier.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getSuppliersService(params?: {
  search?: string;
  is_active?: boolean;
}): Promise<Supplier[]> {
  const res = await axiosClient.get<ApiResponse<Supplier[]>>('/api/v1/suppliers', {
    params,
  });
  return res.data.data;
}

export async function getSupplierByIdService(id: string): Promise<Supplier> {
  const res = await axiosClient.get<ApiResponse<Supplier>>(`/api/v1/suppliers/${id}`);
  return res.data.data;
}

export async function createSupplierService(payload: SupplierCreatePayload): Promise<Supplier> {
  const res = await axiosClient.post<ApiResponse<Supplier>>('/api/v1/suppliers', payload);
  return res.data.data;
}

export async function updateSupplierService(
  id: string,
  payload: SupplierUpdatePayload
): Promise<Supplier> {
  const res = await axiosClient.put<ApiResponse<Supplier>>(`/api/v1/suppliers/${id}`, payload);
  return res.data.data;
}

export async function deleteSupplierService(id: string): Promise<{ id: string; message: string }> {
  const res = await axiosClient.delete<ApiResponse<{ id: string; message: string }>>(
    `/api/v1/suppliers/${id}`
  );
  return res.data.data;
}
