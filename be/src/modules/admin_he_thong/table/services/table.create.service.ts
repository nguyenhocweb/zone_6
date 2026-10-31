import crypto from 'crypto';
import mongoose from 'mongoose';
import { TableRepository } from '../repositories/table.repository.js';
import { CreateTableDto } from '../schemas/table.schema.js';
import { ConflictError } from '../../../../core/errors.js';
import { ITableDoc } from '../models/table.model.js';

export class TableCreateService {
  private repo: TableRepository;

  constructor() {
    this.repo = new TableRepository();
  }

  async execute(dto: CreateTableDto): Promise<ITableDoc> {
    const existing = await this.repo.findByStoreAndNumber(dto.store_id, dto.table_number);
    if (existing && existing.is_active) {
      throw new ConflictError(`Bàn "${dto.table_number}" đã tồn tại tại cơ sở này!`);
    }

    const qrToken = crypto.randomBytes(16).toString('hex');

    if (existing && !existing.is_active) {
      existing.is_active = true;
      existing.zone_name = dto.zone_name || 'Sảnh Chính';
      existing.capacity = dto.capacity || 4;
      existing.qr_token = qrToken;
      await existing.save();
      return existing;
    }

    return this.repo.create({
      store_id: new mongoose.Types.ObjectId(dto.store_id),
      table_number: dto.table_number,
      zone_name: dto.zone_name || 'Sảnh Chính',
      capacity: dto.capacity || 4,
      qr_token: qrToken,
      status: 'AVAILABLE',
      is_active: true,
    });
  }
}
