import mongoose from 'mongoose';
import { PurchaseRequisitionRepository } from '../repositories/purchase-requisition.repository.js';
import { StoreConfigModel } from '../../../admin_he_thong/store-config/models/store-config.model.js';
import { BadRequestError } from '../../../../core/errors.js';
import type { CreateRequisitionDto } from '../schemas/purchase-requisition.schema.js';

export class RequisitionCreateService {
  private repo: PurchaseRequisitionRepository;

  constructor() {
    this.repo = new PurchaseRequisitionRepository();
  }

  async execute(
    dto: CreateRequisitionDto,
    currentUser: { id: string; role: string; full_name?: string; assigned_store_id?: string }
  ) {
    // 1. Xác định storeId
    const storeId = dto.store_id || currentUser.assigned_store_id;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      throw new BadRequestError('Cơ sở yêu cầu không hợp lệ hoặc người dùng chưa được gắn cơ sở');
    }

    // 2. Lấy thông tin cơ sở
    const store = await StoreConfigModel.findById(storeId).lean();
    if (!store) {
      throw new BadRequestError('Không tìm thấy thông tin cơ sở');
    }

    // 3. Sinh mã phiếu duy nhất dạng PR-YYYYMMDD-001
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const count = await this.repo.countToday(datePrefix);
    const sequence = String(count + 1).padStart(3, '0');
    const storeSuffix = store.store_code ? `-${store.store_code}` : '';
    const code = `PR-${datePrefix}${storeSuffix}-${sequence}`;

    // 4. Chuẩn hóa items
    const items = dto.items.map((item) => ({
      material_id: item.material_id,
      material_code: item.material_code,
      material_name: item.material_name,
      category: item.category,
      unit: item.unit,
      current_stock: item.current_stock || 0,
      min_threshold: item.min_threshold || 0,
      requested_quantity: item.requested_quantity,
      approved_quantity: null,
      suggested_supplier_id: item.suggested_supplier_id || null,
      suggested_supplier_name: item.suggested_supplier_name || null,
      status: 'PENDING' as const,
    }));

    // 5. Lưu vào CSDL
    const created = await this.repo.create({
      code,
      store_id: new mongoose.Types.ObjectId(storeId),
      store_name: store.store_name,
      creator_id: new mongoose.Types.ObjectId(currentUser.id),
      creator_name: currentUser.full_name || 'Nhân sự',
      creator_role: currentUser.role,
      status: 'PENDING',
      priority: dto.priority || 'NORMAL',
      expected_delivery_date: dto.expected_delivery_date ? new Date(dto.expected_delivery_date) : null,
      notes: dto.notes || null,
      items,
    });

    return created;
  }
}
