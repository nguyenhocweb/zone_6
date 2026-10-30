import { ShiftConfigRepository } from '../repositories/shift-config.repository.js';
import { IShiftConfigDoc } from '../models/shift-config.model.js';
import { ShiftConfigUpdateInput } from '../schemas/shift-config.schema.js';
import { calculateShiftWorkHours } from './shift-config.create.service.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../../../core/errors.js';

export class ShiftConfigUpdateService {
  private repo: ShiftConfigRepository;

  constructor() {
    this.repo = new ShiftConfigRepository();
  }

  async execute(id: string, input: ShiftConfigUpdateInput): Promise<IShiftConfigDoc> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ca làm việc cần cập nhật');
    }

    const updates: Partial<IShiftConfigDoc> = {};

    if (input.shift_name !== undefined) {
      updates.shift_name = input.shift_name.trim();
    }

    if (input.shift_code !== undefined && input.shift_code.trim() !== '') {
      const newCode = input.shift_code.trim().toUpperCase();
      if (newCode !== existing.shift_code) {
        const duplicate = await this.repo.findByCode(newCode, existing.store_id);
        if (duplicate) {
          throw new ConflictError(`Mã ca làm việc '${newCode}' đã tồn tại trong hệ thống`);
        }
        updates.shift_code = newCode;
      }
    }

    const startTime = input.start_time || existing.start_time;
    const endTime = input.end_time || existing.end_time;

    if (input.start_time !== undefined) updates.start_time = input.start_time;
    if (input.end_time !== undefined) updates.end_time = input.end_time;

    if (input.work_hours !== undefined) {
      updates.work_hours = input.work_hours;
    } else if (input.start_time !== undefined || input.end_time !== undefined) {
      updates.work_hours = calculateShiftWorkHours(startTime, endTime);
    }

    const minStaff = input.min_staff !== undefined ? input.min_staff : existing.min_staff;
    const maxStaff = input.max_staff !== undefined ? input.max_staff : existing.max_staff;

    if (maxStaff < minStaff) {
      throw new BadRequestError(`Số nhân viên tối đa (${maxStaff}) không được nhỏ hơn số tối thiểu (${minStaff})`);
    }

    if (input.min_staff !== undefined) updates.min_staff = input.min_staff;
    if (input.max_staff !== undefined) updates.max_staff = input.max_staff;
    if (input.min_barista !== undefined) updates.min_barista = input.min_barista;
    if (input.min_service !== undefined) updates.min_service = input.min_service;
    if (input.color !== undefined) updates.color = input.color;
    if (input.apply_days !== undefined) updates.apply_days = input.apply_days;
    if (input.display_order !== undefined) updates.display_order = input.display_order;
    if (input.is_active !== undefined) updates.is_active = input.is_active;
    if (input.description !== undefined) updates.description = input.description;

    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Không thể cập nhật ca làm việc');
    }

    return updated;
  }
}
