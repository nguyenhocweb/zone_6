import mongoose from 'mongoose';
import { TableZoneModel, ITableZoneDoc } from '../models/table-zone.model.js';
import { TableModel } from '../models/table.model.js';

export class TableZoneRepository {
  async listByStore(storeId: string): Promise<ITableZoneDoc[]> {
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return [];
    }

    const sId = new mongoose.Types.ObjectId(storeId);

    // 1. Lấy danh sách zones đã có
    let zones = await TableZoneModel.find({
      store_id: sId,
      is_active: true,
    })
      .sort({ order: 1, created_at: 1 })
      .exec();

    // 2. Nếu cơ sở hoàn toàn mới (chưa từng tạo tầng nào), tự động khởi tạo mặc định 1 tầng: 'Tầng 1'
    const hasAnyZonesEver = await TableZoneModel.exists({ store_id: sId });
    if (!hasAnyZonesEver && zones.length === 0) {
      await TableZoneModel.create({
        store_id: sId,
        name: 'Tầng 1',
        order: 1,
        is_active: true,
      });
      zones = await TableZoneModel.find({ store_id: sId, is_active: true })
        .sort({ order: 1, created_at: 1 })
        .exec();
    }

    // 3. Quét các bàn hiện có xem có zone_name nào chưa được đăng ký trong table_zones không
    const distinctTableZones = await TableModel.distinct('zone_name', {
      store_id: sId,
      is_active: true,
    });

    const existingZoneNames = new Set(zones.map((z) => z.name));
    let hasNew = false;
    for (const zName of distinctTableZones) {
      if (zName && !existingZoneNames.has(zName)) {
        await TableZoneModel.findOneAndUpdate(
          { store_id: sId, name: zName },
          { $set: { store_id: sId, name: zName, order: zones.length + 1, is_active: true } },
          { upsert: true }
        );
        hasNew = true;
      }
    }

    if (hasNew) {
      zones = await TableZoneModel.find({ store_id: sId, is_active: true })
        .sort({ order: 1, created_at: 1 })
        .exec();
    }

    return zones;
  }

  async findByName(storeId: string, name: string): Promise<ITableZoneDoc | null> {
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) return null;
    return TableZoneModel.findOne({
      store_id: new mongoose.Types.ObjectId(storeId),
      name: name.trim(),
    }).exec();
  }

  async create(storeId: string, name: string): Promise<ITableZoneDoc> {
    const sId = new mongoose.Types.ObjectId(storeId);
    const existing = await TableZoneModel.findOne({ store_id: sId, name: name.trim() });
    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        await existing.save();
      }
      return existing;
    }

    const count = await TableZoneModel.countDocuments({ store_id: sId });
    return TableZoneModel.create({
      store_id: sId,
      name: name.trim(),
      order: count + 1,
      is_active: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const res = await TableZoneModel.findByIdAndUpdate(id, { is_active: false }).exec();
    return !!res;
  }
}

