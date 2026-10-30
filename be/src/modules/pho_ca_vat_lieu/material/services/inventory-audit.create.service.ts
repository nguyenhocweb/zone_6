import mongoose from 'mongoose';
import { InventoryAuditRepository } from '../repositories/inventory-audit.repository.js';
import { InventoryAuditConfigRepository } from '../repositories/inventory-audit-config.repository.js';
import type { InventoryAuditCreateDto } from '../schemas/inventory-audit.schema.js';
import { BadRequestError, ForbiddenError } from '../../../../core/errors.js';
import { UserModel } from '../../../quan_ly/staff/models/user.model.js';

export interface AuditCreatorInfo {
  id: string;
  name: string;
  role: string;
  user_code?: string | null;
  email?: string | null;
}

export class InventoryAuditCreateService {
  constructor(
    private repo: InventoryAuditRepository = new InventoryAuditRepository(),
    private configRepo: InventoryAuditConfigRepository = new InventoryAuditConfigRepository()
  ) {}

  async createAudit(dto: InventoryAuditCreateDto, creator: AuditCreatorInfo) {
    if (!mongoose.Types.ObjectId.isValid(dto.store_id)) {
      throw new BadRequestError('Mã chi nhánh (store_id) không hợp lệ');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError('Phiếu kiểm kho phải có ít nhất 1 vật tư kiểm đếm');
    }

    // 1. Kiểm tra phân quyền tạo phiếu kiểm kho theo cấu hình của chi nhánh
    const config = await this.configRepo.ensureConfig(dto.store_id);
    const allowedCreatorRoles = config.allowed_creator_roles || [];
    if (
      allowedCreatorRoles.length > 0 &&
      !allowedCreatorRoles.includes(creator.role) &&
      creator.role !== 'admin_he_thong'
    ) {
      throw new ForbiddenError(
        `Vai trò "${creator.role}" không được phân quyền tạo phiếu kiểm kho theo cấu hình của chi nhánh này!`
      );
    }

    // 2. Tra cứu thông tin tài khoản nhân viên (user_code, email)
    let userCode = creator.user_code;
    let email = creator.email;
    if ((!userCode || !email) && mongoose.Types.ObjectId.isValid(creator.id)) {
      const userDoc = await UserModel.findById(creator.id).lean();
      if (userDoc) {
        userCode = userDoc.user_code;
        email = userDoc.email;
      }
    }

    // 3. Tính toán lại chênh lệch cho từng vật tư & đếm số lượng lệch
    let discrepancyCount = 0;
    const computedItems = dto.items.map((item) => {
      const diff = Number((item.actual_quantity - item.system_quantity).toFixed(2));
      if (Math.abs(diff) > 0.0001) {
        discrepancyCount++;
      }
      return {
        ...item,
        difference: diff,
      };
    });

    // 4. Tạo mã kiểm kho tự động: AUD-YYYYMMDD-001
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayCount = await this.repo.countTodayAudits();
    const seq = String(todayCount + 1).padStart(3, '0');
    const auditCode = `AUD-${yyyy}${mm}${dd}-${seq}`;

    const newAudit = await this.repo.create({
      audit_code: auditCode,
      store_id: new mongoose.Types.ObjectId(dto.store_id) as any,
      created_by_id: new mongoose.Types.ObjectId(creator.id) as any,
      created_by_name: creator.name || 'Nhân viên kiểm kho',
      created_by_user_code: userCode || null,
      created_by_email: email || null,
      created_by_role: creator.role || 'nhan_vien',
      audit_shift: dto.audit_shift?.trim() || null,
      items: computedItems as any,
      total_items_checked: computedItems.length,
      discrepancy_count: discrepancyCount,
      status: 'pending_review',
      adjustment_notes: dto.adjustment_notes || null,
    });

    return newAudit;
  }
}
