import { ShiftConfigRepository } from '../repositories/shift-config.repository.js';
import { IShiftConfigDoc } from '../models/shift-config.model.js';

export class ShiftConfigResetService {
  private repo: ShiftConfigRepository;

  constructor() {
    this.repo = new ShiftConfigRepository();
  }

  async execute(storeId?: string | null): Promise<IShiftConfigDoc[]> {
    return this.repo.resetDefaults(storeId);
  }
}
