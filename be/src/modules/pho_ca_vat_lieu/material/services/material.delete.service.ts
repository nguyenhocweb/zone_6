import { MaterialRepository } from '../repositories/material.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class MaterialDeleteService {
  constructor(private repo: MaterialRepository = new MaterialRepository()) {}

  async deleteMaterial(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy vật liệu với ID: ${id}`);
    }

    await this.repo.delete(id);
    return {
      success: true,
      message: `Đã xóa nguyên vật liệu "${existing.name}" khỏi hệ thống kho.`,
    };
  }
}
