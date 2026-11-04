import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableUpdateService } from '../services/table.update.service.js';
import { TableShiftVerifyService } from '../services/table-shift.verify.service.js';
import { emitTableEvent } from '../socket/table.socket.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { ForbiddenError, BadRequestError } from '../../../../core/errors.js';
import mongoose from 'mongoose';

const service = new TableUpdateService();
const shiftVerifyService = new TableShiftVerifyService();

export const updateTableController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tableId = String(req.params.id);
  if (!tableId || tableId === 'undefined' || !mongoose.Types.ObjectId.isValid(tableId)) {
    throw new BadRequestError('Mã định danh bàn (tableId) không hợp lệ');
  }
  const role = req.user?.role || '';
  const canManageStructure = ['admin_he_thong', 'quan_ly', 'truong_ca'].includes(role);

  // 1. Kiểm tra quyền nhân viên trong ca
  // "trạng thái bàn này chỉ có nhân viên trong ca mới có thể cập nhật"
  const isSupervisor = ['admin_he_thong', 'quan_ly'].includes(role);
  if (!isSupervisor) {
    const shiftCheck = await shiftVerifyService.verify(req.user as any);
    if (!shiftCheck.inShift) {
      throw new ForbiddenError(
        shiftCheck.reason || 'Chỉ nhân viên đang trong ca trực (đã Điểm Danh Check-in) mới có quyền cập nhật trạng thái bàn.'
      );
    }
  }

  // 2. Nếu là nhân viên hoặc phó ca: CẤM sửa tên bàn, số ghế, tầng. Chỉ được cập nhật trạng thái bàn (status)
  const payload = { ...req.body };
  if (!canManageStructure) {
    const keys = Object.keys(payload);
    const hasDisallowedFields = keys.some((k) => k !== 'status');
    if (hasDisallowedFields) {
      throw new ForbiddenError('Nhân viên và phó ca chỉ có quyền cập nhật trạng thái phục vụ của bàn');
    }
  }

  const result = await service.execute(tableId, payload);
  const tableObj = result.toObject ? result.toObject() : result;
  const normalizedTable = {
    ...tableObj,
    id: result._id.toString(),
    _id: result._id.toString(),
  };

  // 3. Phát tín hiệu Socket.io thời gian thực cập nhật sơ đồ bàn cho tất cả màn hình
  const storeId = result.store_id ? result.store_id.toString() : '';
  if (storeId) {
    emitTableEvent(storeId, 'table:updated', {
      table: normalizedTable,
      actionUser: {
        userId: req.user?.userId,
        name: req.user?.name,
        role: req.user?.role,
      },
    });
  }

  res.json({
    success: true,
    message: 'Cập nhật bàn thành công',
    data: normalizedTable,
  });
});
