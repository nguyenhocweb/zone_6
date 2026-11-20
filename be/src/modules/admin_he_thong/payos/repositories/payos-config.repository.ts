import mongoose from 'mongoose';
import { PayOSConfigModel, IPayOSConfigDoc } from '../models/payos-config.model.js';
import { CreatePayOSConfigDTO, UpdatePayOSConfigDTO } from '../schemas/payos-config.schema.js';

export class PayOSConfigRepository {
  private normalizeDoc(doc: any): any {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    obj.id = obj._id ? obj._id.toString() : obj.id;
    return obj;
  }

  async findAll(): Promise<IPayOSConfigDoc[]> {
    const docs = await PayOSConfigModel.find().sort({ is_default: -1, created_at: -1 }).lean({ virtuals: true });
    return docs.map((doc: any) => this.normalizeDoc(doc));
  }

  async findById(id: string): Promise<IPayOSConfigDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await PayOSConfigModel.findById(id);
    return this.normalizeDoc(doc);
  }

  async findDefault(): Promise<IPayOSConfigDoc | null> {
    // Ưu tiên tài khoản được chọn làm chính và đang active
    const defaultConfig = await PayOSConfigModel.findOne({ is_default: true, is_active: true }).lean({ virtuals: true });
    if (defaultConfig) return this.normalizeDoc(defaultConfig);

    // Fallback: nếu chưa có tài khoản nào is_default, lấy tài khoản active đầu tiên
    const fallback = await PayOSConfigModel.findOne({ is_active: true }).lean({ virtuals: true });
    return this.normalizeDoc(fallback);
  }

  async count(): Promise<number> {
    return PayOSConfigModel.countDocuments();
  }

  async create(data: CreatePayOSConfigDTO): Promise<IPayOSConfigDoc> {
    const config = new PayOSConfigModel(data);
    const saved = await config.save();
    return this.normalizeDoc(saved);
  }

  async update(id: string, data: UpdatePayOSConfigDTO): Promise<IPayOSConfigDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updated = await PayOSConfigModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    return this.normalizeDoc(updated);
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await PayOSConfigModel.findByIdAndDelete(id);
    return !!result;
  }

  async clearAllDefaultsExcept(id?: string): Promise<void> {
    const query = id ? { _id: { $ne: new mongoose.Types.ObjectId(id) } } : {};
    await PayOSConfigModel.updateMany(query, { $set: { is_default: false } });
  }

  async ensureSingleDefault(targetId: string): Promise<void> {
    // 1. Hạ cờ default của tất cả các tài khoản khác
    await this.clearAllDefaultsExcept(targetId);
    // 2. Bật cờ default cho targetId
    await PayOSConfigModel.findByIdAndUpdate(targetId, { $set: { is_default: true, is_active: true } });
  }

  async promoteNextAvailableDefault(): Promise<void> {
    const nextAccount = await PayOSConfigModel.findOne({ is_active: true }).sort({ created_at: -1 });
    if (nextAccount) {
      await PayOSConfigModel.findByIdAndUpdate(nextAccount._id, { $set: { is_default: true } });
    }
  }
}

