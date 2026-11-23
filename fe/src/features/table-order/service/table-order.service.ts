import axiosClient from '@/core/api/axios-instance';
import { TableVerifyResponse, CreateTableOrderDto, TableOrderResult } from '../type/table-order.type';

export interface IPublicStoreTables {
  id: string;
  name: string;
  code?: string;
  address: string;
  tables: Array<{
    id: string;
    tableNumber: string;
    zoneName: string;
    status: string;
    qrToken: string;
  }>;
}

export const tableOrderService = {
  async getPublicStoresAndTables(): Promise<IPublicStoreTables[]> {
    try {
      const res = await axiosClient.get('/api/v1/pos/table-order/public-tables');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

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
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.categories)) return data.categories;
      return [];
    } catch {
      return [];
    }
  },

  async getMenu(storeId?: string): Promise<any[]> {
    try {
      const params = storeId ? { store_id: storeId } : {};
      const res = await axiosClient.get('/api/v1/recipes', { params });
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.recipes)) return data.recipes;
      return [];
    } catch {
      return [];
    }
  },

  async getToppings(storeId?: string): Promise<any[]> {
    try {
      const params = storeId ? { store_id: storeId, is_active: true } : { is_active: true };
      const res = await axiosClient.get('/api/v1/sellable-toppings', { params });
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    } catch {
      return [];
    }
  },

  async submitOrder(payload: CreateTableOrderDto): Promise<TableOrderResult> {
    const res = await axiosClient.post('/api/v1/pos/table-order/submit', payload);
    const d = res.data?.data || {};
    return {
      id: d._id || d.id || '',
      orderCode: d.order_code || d.orderCode || '',
      tableNumber: d.table_number || d.tableNumber || '',
      customerName: d.customer_name || d.customerName || '',
      customerPhone: d.customer_phone || d.customerPhone || '',
      deviceName: d.device_name || d.deviceName || '',
      totalAmount: Number(d.total_amount ?? d.totalAmount ?? 0),
      discountAmount: Number(d.discount_amount ?? d.discountAmount ?? 0),
      finalAmount: Number(d.final_amount ?? d.finalAmount ?? 0),
      paymentMethod: d.payment_method || d.paymentMethod || 'VIETQR',
      paymentStatus: d.payment_status || d.paymentStatus || 'PENDING',
      orderStatus: d.order_status || d.orderStatus || 'PENDING',
      createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    };
  },
};
