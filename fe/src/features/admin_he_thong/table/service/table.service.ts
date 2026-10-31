import axiosClient from '@/core/api/axios-instance';
import { TableItem, CreateTableDto, UpdateTableDto } from '../type/table.type';

export const tableService = {
  async getAll(params?: { store_id?: string; zone_name?: string; status?: string }): Promise<TableItem[]> {
    const res = await axiosClient.get('/api/v1/tables', { params });
    return res.data.data || [];
  },

  async getById(id: string): Promise<TableItem> {
    const res = await axiosClient.get(`/api/v1/tables/${id}`);
    return res.data.data;
  },

  async create(data: CreateTableDto): Promise<TableItem> {
    const res = await axiosClient.post('/api/v1/tables', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateTableDto): Promise<TableItem> {
    const res = await axiosClient.put(`/api/v1/tables/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/tables/${id}`);
  },

  async regenerateToken(id: string): Promise<TableItem> {
    const res = await axiosClient.post(`/api/v1/tables/${id}/regenerate-token`);
    return res.data.data;
  },
};

