import axiosClient from '@/core/api/axios-instance';
import { TableVerifyResponse, CreateTableOrderDto, TableOrderResult } from '../type/table-order.type';

export const tableOrderService = {
  async verifyTable(
    token: string,
    lat?: number,
    lng?: number
  ): Promise<TableVerifyResponse> {
    const params: Record<string, string | number> = { token };
    if (lat !== undefined && lng !== undefined) {
      params.lat = lat;
      params.lng = lng;
    }
    const res = await axiosClient.get('/api/v1/pos/table-order/verify', { params });
    return res.data.data;
  },

  async getCategories(): Promise<any[]> {
    try {
      const res = await axiosClient.get('/api/v1/recipes/categories');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getMenu(storeId?: string): Promise<any[]> {
    const params = storeId ? { store_id: storeId } : {};
    const res = await axiosClient.get('/api/v1/recipes', { params });
    return res.data.data || [];
  },

  async submitOrder(payload: CreateTableOrderDto): Promise<TableOrderResult> {
    const res = await axiosClient.post('/api/v1/pos/table-order/submit', payload);
    return res.data.data;
  },
};

