import { SupplierRepository } from '../repositories/supplier.repository.js';
import type { SupplierCreateDto } from '../schemas/supplier.schema.js';
import { ConflictError, BadRequestError } from '../../../../core/errors.js';

export class SupplierCreateService {
  constructor(private repo: SupplierRepository = new SupplierRepository()) {}

  async createSupplier(dto: SupplierCreateDto) {
    let code = dto.code ? dto.code.trim().toUpperCase() : '';

    if (!code) {
      const count = await this.repo.countAll();
      code = `NCC-${String(count + 1).padStart(3, '0')}`;
    }

    const existing = await this.repo.findByCode(code);
    if (existing) {
      throw new ConflictError(`Mã nhà cung cấp "${code}" đã tồn tại trên hệ thống`);
    }

    const newSupplier = await this.repo.create({
      code,
      name: dto.name.trim(),
      phone: dto.phone?.trim() || null,
      email: dto.email?.trim().toLowerCase() || null,
      address: dto.address?.trim() || null,
      contact_person: dto.contact_person?.trim() || null,
      supplied_materials: (dto.supplied_materials as any) || [],
      notes: dto.notes?.trim() || null,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    return newSupplier;
  }
}
