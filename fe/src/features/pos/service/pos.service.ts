import axiosClient from '@/core/api/axios-instance';
import { IVerifyShiftData, ILiveCartState, IOrderRecord } from '../type/pos.type';

export const posService = {
  async verifyShift(storeId?: string): Promise<IVerifyShiftData> {
    const params = storeId ? { store_id: storeId } : {};
    const res = await axiosClient.get('/api/v1/pos/verify-shift', { params });
    return res.data.data;
  },

  async getSession(storeId: string, shiftId: string, sessionCode: string): Promise<{
    sessionCode: string;
    cart: ILiveCartState;
    activeStaffIds: string[];
  }> {
    const res = await axiosClient.get('/api/v1/pos/session', {
      params: { store_id: storeId, shift_id: shiftId, session_code: sessionCode },
    });
    return res.data.data;
  },

  async updateCart(data: {
    sessionCode: string;
    items: any[];
    tableNumber?: string;
    customerName?: string;
    discount?: number;
  }): Promise<ILiveCartState> {
    const res = await axiosClient.put('/api/v1/pos/cart', data);
    return res.data.data;
  },

  async checkoutOrder(data: {
    storeId: string;
    shiftId?: string;
    sessionCode?: string;
    tableNumber?: string;
    customerName?: string;
    items: any[];
    totalAmount: number;
    discountAmount?: number;
    finalAmount: number;
    paymentMethod: 'VIETQR' | 'CASH' | 'CARD';
  }): Promise<IOrderRecord> {
    const res = await axiosClient.post('/api/v1/pos/checkout', data);
    return res.data.data;
  },

  async getOrderHistory(storeId?: string): Promise<IOrderRecord[]> {
    const params = storeId ? { store_id: storeId } : {};
    const res = await axiosClient.get('/api/v1/pos/orders', { params });
    return res.data.data || [];
  },

  async getRecipes(storeId?: string): Promise<any[]> {
    const params = storeId ? { store_id: storeId } : {};
    const res = await axiosClient.get('/api/v1/recipes', { params });
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.recipes)) return data.recipes;
    return [];
  },

  async getToppings(storeId?: string): Promise<any[]> {
    const params = storeId ? { store_id: storeId, is_active: true } : { is_active: true };
    const res = await axiosClient.get('/api/v1/sellable-toppings', { params });
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  },
};

