import { TableZoneRepository } from '../repositories/table-zone.repository.js';
import { TableModel } from '../models/table.model.js';
import { TableZoneModel } from '../models/table-zone.model.js';
import { BadRequestError, NotFoundError } from '../../../../core/errors.js';

export class TableZoneDeleteService {
  private repo: TableZoneRepository;

  constructor() {
    this.repo = new TableZoneRepository();
  }

  async execute(id: string): Promise<boolean> {
    const zone = await TableZoneModel.findById(id);
    if (!zone || !zone.is_active) {
      throw new NotFoundError('Tầng/khu vực không tồn tại hoặc đã bị xóa.');
    }

    // Kiểm tra xem tầng này có bàn nào đang hoạt động không
    const tableCount = await TableModel.countDocuments({
      store_id: zone.store_id,
      zone_name: zone.name,
      is_active: true,
    });

    if (tableCount > 0) {
      throw new BadRequestError(
        `Không thể xóa ${zone.name} vì đang có ${tableCount} bàn trực thuộc. Vui lòng chuyển hoặc xóa các bàn trước.`
      );
    }

    return this.repo.delete(id);
  }
}
