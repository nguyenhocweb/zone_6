import mongoose from 'mongoose';
import { InventoryAuditRepository } from '../repositories/inventory-audit.repository.js';
import { InventoryAuditConfigRepository } from '../repositories/inventory-audit-config.repository.js';
import type { InventoryAuditUpdateDto } from '../schemas/inventory-audit.schema.js';
import { NotFoundError, ForbiddenError } from '../../../../core/errors.js';
import { UserModel } from '../../../quan_ly/staff/models/user.model.js';

export interface AuditReviewerInfo {
  id: string;
  name: string;
  role: string;
  user_code?: string | null;
}

export class InventoryAuditUpdateService {
  constructor(
    private repo: InventoryAuditRepository = new InventoryAuditRepository(),
    private configRepo: InventoryAuditConfigRepository = new InventoryAuditConfigRepository()
  ) {}

  async updateAudit(id: string, dto: InventoryAuditUpdateDto, reviewer: AuditReviewerInfo) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy phiếu kiểm kho ID: ${id}`);
    }

    // 1. Kiểm tra quyền sửa/duyệt theo cấu hình chi nhánh
    const storeIdStr = existing.store_id ? existing.store_id.toString() : null;
    const config = await this.configRepo.ensureConfig(storeIdStr);
    const allowedReviewerRoles = config.allowed_reviewer_roles || [];
    if (
      allowedReviewerRoles.length > 0 &&
      !allowedReviewerRoles.includes(reviewer.role) &&
      reviewer.role !== 'admin_he_thong'
    ) {
      throw new ForbiddenError(
        `Vai trò "${reviewer.role}" không được phân quyền chỉnh sửa hoặc duyệt phiếu kiểm kho theo cấu hình của chi nhánh này!`
      );
    }

    let reviewerUserCode = reviewer.user_code;
    if (!reviewerUserCode && mongoose.Types.ObjectId.isValid(reviewer.id)) {
      const userDoc = await UserModel.findById(reviewer.id).lean();
      if (userDoc) {
        reviewerUserCode = userDoc.user_code;
      }
    }

    const updatePayload: Record<string, any> = {
      reviewed_by_id: new mongoose.Types.ObjectId(reviewer.id),
      reviewed_by_name: reviewer.name,
      reviewed_by_user_code: reviewerUserCode || null,
      reviewed_by_role: reviewer.role || null,
      reviewed_at: new Date(),
    };

    if (dto.adjustment_notes !== undefined) {
      updatePayload.adjustment_notes = dto.adjustment_notes;
    }

    if (dto.status) {
      updatePayload.status = dto.status;
    } else {
      updatePayload.status = 'adjusted';
    }

    // Nếu có cập nhật danh sách items
    if (dto.items && dto.items.length > 0) {
      let discrepancyCount = 0;
      const recomputedItems = dto.items.map((item) => {
        const diff = Number((item.actual_quantity - item.system_quantity).toFixed(2));
        if (Math.abs(diff) > 0.0001) {
          discrepancyCount++;
        }
        return {
          ...item,
          difference: diff,
        };
      });

      updatePayload.items = recomputedItems;
      updatePayload.total_items_checked = recomputedItems.length;
      updatePayload.discrepancy_count = discrepancyCount;

      // Nếu có yêu cầu đồng bộ số lượng vào kho vật liệu thực tế
      if (dto.apply_to_stock) {
        for (const item of recomputedItems) {
          if (item.material_id && item.category) {
            await this.repo.updateMaterialStock(
              item.category,
              item.material_id,
              item.actual_quantity
            );
          }
        }
        updatePayload.status = 'confirmed';
      }
    } else if (dto.apply_to_stock && existing.items) {
      // Áp dụng items hiện tại vào kho
      for (const item of existing.items) {
        if (item.material_id && item.category) {
          await this.repo.updateMaterialStock(
            item.category,
            item.material_id,
            item.actual_quantity
          );
        }
      }
      updatePayload.status = 'confirmed';
    }

    const updated = await this.repo.update(id, updatePayload);
    return updated;
  }
}
