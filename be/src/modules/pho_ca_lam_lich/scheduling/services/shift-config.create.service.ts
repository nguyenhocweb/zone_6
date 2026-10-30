import { ShiftConfigRepository } from '../repositories/shift-config.repository.js';
import { IShiftConfigDoc } from '../models/shift-config.model.js';
import { ShiftConfigCreateInput } from '../schemas/shift-config.schema.js';
import { BadRequestError, ConflictError } from '../../../../core/errors.js';

export function calculateShiftWorkHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return Math.round((diffMinutes / 60) * 10) / 10;
}

export function generateShiftCode(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return normalized.startsWith('CA_') ? normalized : `CA_${normalized}`;
}

export class ShiftConfigCreateService {
  private repo: ShiftConfigRepository;

  constructor() {
    this.repo = new ShiftConfigRepository();
  }

  async execute(input: ShiftConfigCreateInput): Promise<IShiftConfigDoc> {
    const shiftName = input.shift_name.trim();
    const shiftCode = input.shift_code?.trim() 
      ? input.shift_code.trim().toUpperCase() 
      : generateShiftCode(shiftName);

    const targetStoreId = input.store_id || null;

    // Kiểm tra trùng mã ca
    const existing = await this.repo.findByCode(shiftCode, targetStoreId);
    if (existing) {
      throw new ConflictError(`Mã ca làm việc '${shiftCode}' đã tồn tại trong hệ thống`);
    }

    // Tự động tính work_hours nếu chưa có
    const workHours = input.work_hours || calculateShiftWorkHours(input.start_time, input.end_time);

    // Kiểm tra số lượng nhân sự
    const minStaff = input.min_staff ?? 2;
    const maxStaff = input.max_staff ?? Math.max(minStaff, 4);

    if (maxStaff < minStaff) {
      throw new BadRequestError(`Số nhân viên tối đa (${maxStaff}) không được nhỏ hơn số tối thiểu (${minStaff})`);
    }

    const minBarista = input.min_barista ?? 1;
    const minService = input.min_service ?? 1;

    if (minBarista + minService > maxStaff) {
      throw new BadRequestError(`Tổng định biên tối thiểu Pha chế (${minBarista}) + Phục vụ (${minService}) vượt quá số nhân viên tối đa (${maxStaff})`);
    }

    return this.repo.create({
      shift_code: shiftCode,
      shift_name: shiftName,
      start_time: input.start_time,
      end_time: input.end_time,
      work_hours: workHours,
      min_staff: minStaff,
      max_staff: maxStaff,
      min_barista: minBarista,
      min_service: minService,
      color: input.color || '#D4AF37',
      apply_days: input.apply_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      display_order: input.display_order ?? 99,
      store_id: targetStoreId,
      is_active: input.is_active ?? true,
      description: input.description || '',
    });
  }
}
