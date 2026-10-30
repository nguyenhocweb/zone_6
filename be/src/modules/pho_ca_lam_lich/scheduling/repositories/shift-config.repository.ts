import { 
  ShiftConfigModel, 
  IShiftConfigDoc, 
  DEFAULT_ZONE6_SHIFTS 
} from '../models/shift-config.model.js';

export class ShiftConfigRepository {
  /**
   * Lấy danh sách ca làm việc theo chi nhánh (storeId).
   * Nếu chi nhánh chưa có ca làm việc nào, tự động khởi tạo bộ ca chuẩn Zone Six.
   */
  async findAll(storeId?: string | null): Promise<IShiftConfigDoc[]> {
    const targetStoreId = storeId || null;
    let list = await ShiftConfigModel.find({ store_id: targetStoreId })
      .sort({ display_order: 1, created_at: 1 })
      .exec();

    // Nếu chưa có cấu hình cho chi nhánh này (hoặc toàn chuỗi)
    if (!list || list.length === 0) {
      if (targetStoreId !== null) {
        // Kiểm tra xem toàn chuỗi (store_id: null) đã có chưa
        const globalList = await ShiftConfigModel.find({ store_id: null })
          .sort({ display_order: 1 })
          .exec();

        if (globalList && globalList.length > 0) {
          // Clone từ cấu hình toàn chuỗi sang chi nhánh
          const toClone = globalList.map(item => ({
            shift_code: item.shift_code,
            shift_name: item.shift_name,
            start_time: item.start_time,
            end_time: item.end_time,
            work_hours: item.work_hours,
            min_staff: item.min_staff,
            max_staff: item.max_staff,
            min_barista: item.min_barista,
            min_service: item.min_service,
            color: item.color,
            apply_days: item.apply_days,
            display_order: item.display_order,
            store_id: targetStoreId,
            is_active: item.is_active,
            description: item.description,
          }));
          await ShiftConfigModel.insertMany(toClone);
        } else {
          // Khởi tạo từ default template
          const toInsert = DEFAULT_ZONE6_SHIFTS.map(item => ({
            ...item,
            store_id: targetStoreId,
          }));
          await ShiftConfigModel.insertMany(toInsert);
        }
      } else {
        // Khởi tạo cho toàn chuỗi (store_id: null)
        const toInsert = DEFAULT_ZONE6_SHIFTS.map(item => ({
          ...item,
          store_id: null,
        }));
        await ShiftConfigModel.insertMany(toInsert);
      }

      list = await ShiftConfigModel.find({ store_id: targetStoreId })
        .sort({ display_order: 1, created_at: 1 })
        .exec();
    }

    return list;
  }

  async findById(id: string): Promise<IShiftConfigDoc | null> {
    return ShiftConfigModel.findById(id).exec();
  }

  async findByCode(shiftCode: string, storeId?: string | null): Promise<IShiftConfigDoc | null> {
    const targetStoreId = storeId || null;
    return ShiftConfigModel.findOne({ shift_code: shiftCode.toUpperCase(), store_id: targetStoreId }).exec();
  }

  async create(data: Partial<IShiftConfigDoc>): Promise<IShiftConfigDoc> {
    const doc = new ShiftConfigModel(data);
    return doc.save();
  }

  async update(id: string, data: Partial<IShiftConfigDoc>): Promise<IShiftConfigDoc | null> {
    return ShiftConfigModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async delete(id: string): Promise<IShiftConfigDoc | null> {
    return ShiftConfigModel.findByIdAndDelete(id).exec();
  }

  async resetDefaults(storeId?: string | null): Promise<IShiftConfigDoc[]> {
    const targetStoreId = storeId || null;
    await ShiftConfigModel.deleteMany({ store_id: targetStoreId }).exec();
    const toInsert = DEFAULT_ZONE6_SHIFTS.map(item => ({
      ...item,
      store_id: targetStoreId,
    }));
    await ShiftConfigModel.insertMany(toInsert);
    return ShiftConfigModel.find({ store_id: targetStoreId })
      .sort({ display_order: 1, created_at: 1 })
      .exec();
  }
}
