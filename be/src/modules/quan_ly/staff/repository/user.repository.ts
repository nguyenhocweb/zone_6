import { UserModel, type IUserDoc } from '../models/user.model.js';
import { getRoleDetails, USER_ROLE_LABELS, type UserRole } from '../schemas/user-roles.js';
import type { UserCreateDto, UserResponse, UserUpdateDto } from '../schemas/user.schema.js';

export class UserRepository {
  public toResponse(doc: IUserDoc): UserResponse {
    const role = (doc.role || 'nhan_vien') as UserRole;
    const roleDetail = getRoleDetails(role);
    return {
      id: doc._id.toString(),
      user_code: doc.user_code,
      name: doc.name,
      email: doc.email,
      role,
      role_label: roleDetail.label,
      role_level: roleDetail.level,
      permissions: roleDetail.permissions,
      phone: doc.phone ?? null,
      qr_code: doc.qr_code,
      hourly_rate: doc.hourly_rate ?? 18000,
      position: doc.position ?? 'Nhân viên',
      assigned_store_id: doc.assigned_store_id ? doc.assigned_store_id.toString() : null,
      assigned_stores: Array.isArray(doc.assigned_stores)
        ? doc.assigned_stores.map((s: any) => s.toString())
        : [],
      is_active: doc.is_active,
      created_at: doc.created_at ? doc.created_at.toISOString() : new Date().toISOString(),
      updated_at: doc.updated_at ? doc.updated_at.toISOString() : new Date().toISOString(),
    };
  }

  async findByEmailDoc(email: string): Promise<IUserDoc | null> {
    return UserModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserResponse | null> {
    try {
      const doc = await UserModel.findById(id).exec();
      return doc ? this.toResponse(doc) : null;
    } catch {
      return null;
    }
  }

  async findByIdDoc(id: string): Promise<IUserDoc | null> {
    try {
      return await UserModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserResponse | null> {
    const doc = await this.findByEmailDoc(email);
    return doc ? this.toResponse(doc) : null;
  }

  async findByCode(code: string): Promise<UserResponse | null> {
    const doc = await UserModel.findOne({ user_code: code.trim().toUpperCase() }).exec();
    return doc ? this.toResponse(doc) : null;
  }

  async getList(query?: { role?: string; is_active?: boolean; search?: string; store_id?: string }): Promise<UserResponse[]> {
    const filter: Record<string, unknown> = {};

    if (query?.role) {
      filter.role = query.role;
    }
    if (typeof query?.is_active === 'boolean') {
      filter.is_active = query.is_active;
    }
    if (query?.store_id) {
      filter.$or = [
        { assigned_store_id: query.store_id },
        { assigned_stores: query.store_id },
      ];
    }
    if (query?.search) {
      const searchOr = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { user_code: { $regex: query.search, $options: 'i' } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    const docs = await UserModel.find(filter).sort({ created_at: -1 }).exec();
    return docs.map((d) => this.toResponse(d));
  }

  async create(dto: UserCreateDto): Promise<UserResponse> {
    const doc = await UserModel.create({
      user_code: dto.user_code,
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      password: dto.password, // Plain text per user request
      role: dto.role,
      phone: dto.phone ?? null,
      hourly_rate: dto.hourly_rate ?? 18000,
      position: dto.position ?? 'Nhân viên',
      assigned_store_id: dto.assigned_store_id || null,
      assigned_stores: dto.assigned_stores || [],
      is_active: dto.is_active ?? true,
    });
    return this.toResponse(doc);
  }

  async update(id: string, dto: UserUpdateDto): Promise<UserResponse | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    return doc ? this.toResponse(doc) : null;
  }

  async upsertSeedUser(data: {
    user_code: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    qr_code?: string;
    hourly_rate?: number;
    position?: string;
  }): Promise<UserResponse> {
    const doc = await UserModel.findOneAndUpdate(
      { email: data.email.trim().toLowerCase() },
      {
        $set: {
          user_code: data.user_code,
          name: data.name,
          password: data.password,
          role: data.role,
          phone: data.phone || null,
          qr_code: data.qr_code || `QR-${data.user_code}`,
          hourly_rate: data.hourly_rate || 18000,
          position: data.position || 'Nhân viên',
          is_active: true,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).exec();

    return this.toResponse(doc!);
  }

  async count(): Promise<number> {
    return UserModel.countDocuments().exec();
  }
}
