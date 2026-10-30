import mongoose from 'mongoose';
import {
  InventoryAuditConfigModel,
  DEFAULT_AUDIT_SHIFTS,
  DEFAULT_CREATOR_ROLES,
  DEFAULT_REVIEWER_ROLES,
  type IInventoryAuditConfigDoc,
} from '../models/inventory-audit-config.model.js';
import { StoreConfigModel } from '../../../admin_he_thong/store-config/models/store-config.model.js';

export class InventoryAuditConfigRepository {
  /**
   * Tìm cấu hình kiểm kho theo store_id, nếu không có thì tìm cấu hình chung toàn chuỗi
   */
  async findByStoreId(storeId?: string | null): Promise<IInventoryAuditConfigDoc | null> {
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      const config = await InventoryAuditConfigModel.findOne({
        store_id: new mongoose.Types.ObjectId(storeId),
      }).exec();
      if (config) return config;
    }

    // Fallback: Tìm cấu hình mặc định (store_id === null)
    return InventoryAuditConfigModel.findOne({ store_id: null }).exec();
  }

  /**
   * Đảm bảo luôn tồn tại một cấu hình hợp lệ (Tự sinh mặc định nếu chưa có)
   */
  async ensureConfig(storeId?: string | null): Promise<IInventoryAuditConfigDoc> {
    const existing = await this.findByStoreId(storeId);
    if (existing) {
      return existing;
    }

    let storeName: string | null = null;
    let sId: mongoose.Types.ObjectId | null = null;

    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      sId = new mongoose.Types.ObjectId(storeId);
      const storeDoc = await StoreConfigModel.findById(sId).lean();
      if (storeDoc) {
        storeName = storeDoc.store_name;
      }
    }

    const created = await InventoryAuditConfigModel.create({
      store_id: sId,
      store_name: storeName,
      allowed_creator_roles: DEFAULT_CREATOR_ROLES,
      allowed_reviewer_roles: DEFAULT_REVIEWER_ROLES,
      audit_shifts: DEFAULT_AUDIT_SHIFTS,
      frequency_type: 'daily',
      interval_days: 1,
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      reminder_time: '22:00',
      is_active: true,
    });

    return created;
  }

  /**
   * Cập nhật hoặc khởi tạo cấu hình cho chi nhánh
   */
  async upsertConfig(
    storeId: string | null,
    payload: Record<string, any>
  ): Promise<IInventoryAuditConfigDoc> {
    let sId: mongoose.Types.ObjectId | null = null;
    let storeName = payload.store_name || null;

    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      sId = new mongoose.Types.ObjectId(storeId);
      if (!storeName) {
        const storeDoc = await StoreConfigModel.findById(sId).lean();
        if (storeDoc) {
          storeName = storeDoc.store_name;
        }
      }
    }

    const filter = { store_id: sId };
    const update = {
      $set: {
        ...payload,
        store_id: sId,
        store_name: storeName,
        updated_at: new Date(),
      },
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const result = await InventoryAuditConfigModel.findOneAndUpdate(filter, update, options).exec();
    return result as IInventoryAuditConfigDoc;
  }
}
