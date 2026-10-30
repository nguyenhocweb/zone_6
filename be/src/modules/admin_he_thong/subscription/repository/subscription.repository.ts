import { SubscriptionModel, type ISubscriptionDoc } from '../models/subscription.model.js';
import type { 
  SubscriptionCreateDto, 
  SubscriptionResponse, 
  SubscriptionUpdateDto 
} from '../schemas/subscription.schema.js';

export class SubscriptionRepository {
  private toResponse(doc: ISubscriptionDoc): SubscriptionResponse {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description ?? null,
      price: doc.price,
      duration_days: doc.duration_days,
      max_projects: doc.max_projects,
      is_active: doc.is_active,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async getList(params: { skip: number; limit: number; search?: string; isActive?: boolean }): Promise<SubscriptionResponse[]> {
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (typeof params.isActive === 'boolean') {
      filter.is_active = params.isActive;
    }

    const docs = await SubscriptionModel.find(filter)
      .sort({ created_at: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .exec();

    return docs.map(d => this.toResponse(d));
  }

  async count(params: { search?: string; isActive?: boolean }): Promise<number> {
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (typeof params.isActive === 'boolean') {
      filter.is_active = params.isActive;
    }

    return SubscriptionModel.countDocuments(filter).exec();
  }

  async getById(id: string): Promise<SubscriptionResponse | null> {
    try {
      const doc = await SubscriptionModel.findById(id).exec();
      return doc ? this.toResponse(doc) : null;
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<SubscriptionResponse | null> {
    const doc = await SubscriptionModel.findOne({ name: name.trim() }).exec();
    return doc ? this.toResponse(doc) : null;
  }

  async create(dto: SubscriptionCreateDto): Promise<SubscriptionResponse> {
    const doc = await SubscriptionModel.create({
      name: dto.name.trim(),
      description: dto.description ? dto.description.trim() : null,
      price: dto.price,
      duration_days: dto.duration_days,
      max_projects: dto.max_projects,
      is_active: dto.is_active,
    });

    return this.toResponse(doc);
  }

  async update(id: string, dto: SubscriptionUpdateDto): Promise<SubscriptionResponse> {
    const updatePayload: Record<string, unknown> = {};

    if (dto.name !== undefined) updatePayload.name = dto.name.trim();
    if (dto.description !== undefined) updatePayload.description = dto.description ? dto.description.trim() : null;
    if (dto.price !== undefined) updatePayload.price = dto.price;
    if (dto.duration_days !== undefined) updatePayload.duration_days = dto.duration_days;
    if (dto.max_projects !== undefined) updatePayload.max_projects = dto.max_projects;
    if (dto.is_active !== undefined) updatePayload.is_active = dto.is_active;

    const doc = await SubscriptionModel.findByIdAndUpdate(id, updatePayload, { new: true }).exec();
    if (!doc) {
      throw new Error('Subscription not found');
    }

    return this.toResponse(doc);
  }

  async delete(id: string): Promise<void> {
    await SubscriptionModel.findByIdAndDelete(id).exec();
  }
}
