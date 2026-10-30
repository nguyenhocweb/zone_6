import { SellableToppingRepository } from '../repositories/sellable-topping.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class SellableToppingDeleteService {
  constructor(private repo: SellableToppingRepository = new SellableToppingRepository()) {}

  async execute(id: string): Promise<boolean> {
    const success = await this.repo.delete(id);
    if (!success) {
      throw new NotFoundError('Không tìm thấy topping bán ra để xóa');
    }
    return true;
  }
}
