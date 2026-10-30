import mongoose from 'mongoose';
import { InventoryAuditConfigRepository } from '../repositories/inventory-audit-config.repository.js';
import { InventoryAuditConfigGetService } from './inventory-audit-config.get.service.js';
import type {
  InventoryAuditConfigUpdateDto,
  InventoryAuditConfigResponse,
} from '../schemas/inventory-audit.schema.js';
import { BadRequestError } from '../../../../core/errors.js';

export interface AuditConfigUpdaterInfo {
  id: string;
  name: string;
  role: string;
}

export class InventoryAuditConfigUpdateService {
  constructor(
    private configRepo = new InventoryAuditConfigRepository(),
    private getService = new InventoryAuditConfigGetService()
  ) {}

  async updateConfig(
    dto: InventoryAuditConfigUpdateDto,
    updater: AuditConfigUpdaterInfo
  ): Promise<InventoryAuditConfigResponse> {
    if (dto.store_id && !mongoose.Types.ObjectId.isValid(dto.store_id)) {
      throw new BadRequestError('Mã chi nhánh (store_id) không hợp lệ');
    }

    if (!dto.allowed_creator_roles || dto.allowed_creator_roles.length === 0) {
      throw new BadRequestError('Cần chỉ định ít nhất 1 vai trò được phép tạo phiếu kiểm kho');
    }

    if (!dto.allowed_reviewer_roles || dto.allowed_reviewer_roles.length === 0) {
      throw new BadRequestError('Cần chỉ định ít nhất 1 vai trò được phép sửa/duyệt phiếu kiểm kho');
    }

    if (!dto.audit_shifts || dto.audit_shifts.length === 0) {
      throw new BadRequestError('Cần cấu hình ít nhất 1 ca kiểm kho trong ngày');
    }

    const payload = {
      allowed_creator_roles: dto.allowed_creator_roles,
      allowed_reviewer_roles: dto.allowed_reviewer_roles,
      audit_shifts: dto.audit_shifts,
      frequency_type: dto.frequency_type || 'daily',
      interval_days: dto.interval_days || 1,
      days_of_week: dto.days_of_week || [0, 1, 2, 3, 4, 5, 6],
      reminder_time: dto.reminder_time || '22:00',
      is_active: dto.is_active ?? true,
      updated_by_id: mongoose.Types.ObjectId.isValid(updater.id)
        ? new mongoose.Types.ObjectId(updater.id)
        : null,
      updated_by_name: updater.name || 'Quản lý',
      updated_by_role: updater.role || 'quan_ly',
    };

    await this.configRepo.upsertConfig(dto.store_id || null, payload);

    return this.getService.getConfig(dto.store_id || null);
  }
}
