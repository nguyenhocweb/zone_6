import { TableModel, ITableDoc } from '../models/table.model.js';
import mongoose from 'mongoose';

export class TableRepository {
  async create(data: Partial<ITableDoc>): Promise<ITableDoc> {
    return TableModel.create(data);
  }

  async findById(id: string): Promise<ITableDoc | null> {
    return TableModel.findById(id).exec();
  }

  async findByToken(token: string): Promise<ITableDoc | null> {
    return TableModel.findOne({ qr_token: token, is_active: true }).exec();
  }

  async findByStoreAndNumber(storeId: string, tableNumber: string): Promise<ITableDoc | null> {
    return TableModel.findOne({
      store_id: new mongoose.Types.ObjectId(storeId),
      table_number: tableNumber,
    }).exec();
  }

  async listByStore(storeId: string): Promise<ITableDoc[]> {
    return TableModel.find({
      store_id: new mongoose.Types.ObjectId(storeId),
      is_active: true,
    })
      .sort({ zone_name: 1, table_number: 1 })
      .exec();
  }

  async update(id: string, data: Partial<ITableDoc>): Promise<ITableDoc | null> {
    return TableModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await TableModel.findByIdAndUpdate(id, { is_active: false }).exec();
    return !!res;
  }
}

