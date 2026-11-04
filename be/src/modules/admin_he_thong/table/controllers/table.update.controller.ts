import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableUpdateService } from '../services/table.update.service.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { ForbiddenError } from '../../../../core/errors.js';

const service = new TableUpdateService();

export const updateTableController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tableId = String(req.params.id);
  const role = req.user?.role || '';
  const canManageStructure = ['admin_he_thong', 'quan_ly', 'truong_ca'].includes(role);

  // Nếu là nhân viên hoặc phó ca: CẤM sửa tên bàn, số ghế, tầng. Chỉ được cập nhật trạng thái bàn (status)
  const payload = { ...req.body };
  if (!canManageStructure) {
    const keys = Object.keys(payload);
    const hasDisallowedFields = keys.some((k) => k !== 'status');
    if (hasDisallowedFields) {
      throw new ForbiddenError('Nhân viên và phó ca chỉ có quyền cập nhật trạng thái phục vụ của bàn');
    }
  }

  const result = await service.execute(tableId, payload);
  res.json({
    success: true,
    message: 'Cập nhật bàn thành công',
    data: result,
  });
});
