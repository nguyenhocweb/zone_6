import axiosClient from '@/core/api/axios-instance';
import { TableItem, TableZoneItem, CreateTableDto, UpdateTableDto, CreateTableZoneDto } from '../type/table.type';

export const tableService = {
  async getAll(params?: { store_id?: string; zone_name?: string; status?: string }): Promise<TableItem[]> {
    const res = await axiosClient.get('/api/v1/tables', { params });
    const raw = res.data.data || [];
    return raw.map((t: any) => ({
      ...t,
      id: t.id || t._id,
    }));
  },

  async getById(id: string): Promise<TableItem> {
    const res = await axiosClient.get(`/api/v1/tables/${id}`);
    const t = res.data.data;
    return t ? { ...t, id: t.id || t._id } : t;
  },

  async create(data: CreateTableDto): Promise<TableItem> {
    const res = await axiosClient.post('/api/v1/tables', data);
    const t = res.data.data;
    return t ? { ...t, id: t.id || t._id } : t;
  },

  async update(id: string, data: UpdateTableDto): Promise<TableItem> {
    const res = await axiosClient.put(`/api/v1/tables/${id}`, data);
    const t = res.data.data;
    return t ? { ...t, id: t.id || t._id } : t;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/tables/${id}`);
  },

  async regenerateToken(id: string): Promise<TableItem> {
    const res = await axiosClient.post(`/api/v1/tables/${id}/regenerate-token`);
    const t = res.data.data;
    return t ? { ...t, id: t.id || t._id } : t;
  },

  // === TẦNG / KHU VỰC (TABLE ZONES) ===
  async getZones(storeId?: string): Promise<TableZoneItem[]> {
    const params = storeId ? { store_id: storeId } : {};
    const res = await axiosClient.get('/api/v1/tables/zones', { params });
    const raw = res.data.data || [];
    return raw.map((z: any) => ({
      ...z,
      id: z.id || z._id,
    }));
  },

  async createZone(data: CreateTableZoneDto): Promise<TableZoneItem> {
    const res = await axiosClient.post('/api/v1/tables/zones', data);
    const z = res.data.data;
    return z ? { ...z, id: z.id || z._id } : z;
  },

  async deleteZone(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/tables/zones/${id}`);
  },

  // === KIỂM TRA QUYỀN TRONG CA (IN-SHIFT CHECK) ===
  async getShiftStatus(storeId?: string): Promise<{
    inShift: boolean;
    mode: 'SUPERVISOR' | 'STAFF';
    shiftName?: string;
    checkInTime?: string;
    reason?: string;
  }> {
    const params = storeId ? { store_id: storeId } : {};
    const res = await axiosClient.get('/api/v1/tables/shift-status', { params });
    return res.data.data;
  },
};

