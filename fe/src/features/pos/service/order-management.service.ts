import axiosClient from '@/core/api/axios-instance';
import { OrderFilterParams, OrderListResponse, IOrderRecord } from '../type/pos.type';

export const orderManagementService = {
  async listAll(params?: OrderFilterParams): Promise<OrderListResponse> {
    const res = await axiosClient.get('/api/v1/pos/orders/all', { params });
    return res.data.data;
  },

  async voidOrder(id: string, reason: string): Promise<IOrderRecord> {
    const res = await axiosClient.post(`/api/v1/pos/orders/${id}/void`, {
      void_reason: reason,
    });
    return res.data.data;
  },

  async confirmCashPayment(id: string): Promise<IOrderRecord> {
    const res = await axiosClient.post(`/api/v1/pos/orders/${id}/confirm-cash`);
    return res.data.data;
  },
};

