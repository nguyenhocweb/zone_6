import { ShiftConfigRepository } from '../repositories/shift-config.repository.js';
import { IShiftConfigDoc } from '../models/shift-config.model.js';

export class ShiftConfigGetService {
  private repo: ShiftConfigRepository;

  constructor() {
    this.repo = new ShiftConfigRepository();
  }

  async execute(storeId?: string | null): Promise<{
    shifts: IShiftConfigDoc[];
    summary: {
      total_shifts: number;
      active_shifts: number;
      total_min_staff_per_day: number;
      total_planned_hours_per_day: number;
    };
  }> {
    const shifts = await this.repo.findAll(storeId);

    const activeShifts = shifts.filter(s => s.is_active);
    const totalMinStaff = activeShifts.reduce((sum, s) => sum + (s.min_staff || 0), 0);
    const totalHours = activeShifts.reduce((sum, s) => sum + (s.work_hours || 0), 0);

    return {
      shifts,
      summary: {
        total_shifts: shifts.length,
        active_shifts: activeShifts.length,
        total_min_staff_per_day: totalMinStaff,
        total_planned_hours_per_day: Math.round(totalHours * 10) / 10,
      },
    };
  }

  async getById(id: string): Promise<IShiftConfigDoc | null> {
    return this.repo.findById(id);
  }
}
