import mongoose from 'mongoose';
import { SupplierModel, type ISupplierDoc } from '../models/supplier.model.js';

export class SupplierRepository {
  async create(data: Partial<ISupplierDoc>): Promise<ISupplierDoc> {
    return await SupplierModel.create(data);
  }

  async findAll(filter: { search?: string; is_active?: boolean } = {}): Promise<ISupplierDoc[]> {
    const query: Record<string, any> = {};

    if (filter.is_active !== undefined) {
      query.is_active = filter.is_active;
    }

    if (filter.search) {
      const reg = new RegExp(filter.search, 'i');
      query.$or = [{ code: reg }, { name: reg }, { phone: reg }, { contact_person: reg }];
    }

    return await SupplierModel.find(query).sort({ created_at: -1 }).lean();
  }

  async findById(id: string): Promise<ISupplierDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await SupplierModel.findById(id).lean();
  }

  async findByCode(code: string): Promise<ISupplierDoc | null> {
    return await SupplierModel.findOne({ code: code.toUpperCase().trim() }).lean();
  }

  async update(id: string, data: Partial<ISupplierDoc>): Promise<ISupplierDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await SupplierModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await SupplierModel.findByIdAndDelete(id);
    return !!res;
  }

  async countAll(): Promise<number> {
    return await SupplierModel.countDocuments();
  }
}
