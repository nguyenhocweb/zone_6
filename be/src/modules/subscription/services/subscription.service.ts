import { ConflictError, NotFoundError } from '../../../core/errors.js';
import { logger } from '../../../core/logger.js';
import { SubscriptionRepository } from '../repository/subscription.repository.js';
import type { 
  PaginatedSubscriptionsResponse, 
  SubscriptionCreateDto, 
  SubscriptionQueryDto, 
  SubscriptionResponse, 
  SubscriptionUpdateDto 
} from '../schemas/subscription.schema.js';

export class SubscriptionService {
  private repo: SubscriptionRepository;

  constructor() {
    this.repo = new SubscriptionRepository();
  }

  async getSubscriptions(query: SubscriptionQueryDto): Promise<PaginatedSubscriptionsResponse> {
    const page = query.page || 1;
    const pageSize = query.page_size || 10;
    const skip = (page - 1) * pageSize;

    const items = await this.repo.getList({
      skip,
      limit: pageSize,
      search: query.search,
      isActive: query.is_active,
    });

    const total = await this.repo.count({
      search: query.search,
      isActive: query.is_active,
    });

    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    };
  }

  async getById(id: string): Promise<SubscriptionResponse> {
    const plan = await this.repo.getById(id);
    if (!plan) {
      throw new NotFoundError(`Không tìm thấy gói dịch vụ với ID '${id}'`);
    }
    return plan;
  }

  async createSubscription(dto: SubscriptionCreateDto): Promise<SubscriptionResponse> {
    const existing = await this.repo.getByName(dto.name.trim());
    if (existing) {
      throw new ConflictError(`Gói dịch vụ với tên '${dto.name}' đã tồn tại trong hệ thống`);
    }

    const created = await this.repo.create(dto);
    logger.info(`Đã tạo mới gói dịch vụ: ${created.name} (${created.id})`);
    return created;
  }

  async updateSubscription(id: string, dto: SubscriptionUpdateDto): Promise<SubscriptionResponse> {
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy gói dịch vụ với ID '${id}'`);
    }

    if (dto.name && dto.name.trim() !== existing.name) {
      const duplicate = await this.repo.getByName(dto.name.trim());
      if (duplicate) {
        throw new ConflictError(`Gói dịch vụ với tên '${dto.name}' đã tồn tại trong hệ thống`);
      }
    }

    const updated = await this.repo.update(id, dto);
    logger.info(`Đã cập nhật gói dịch vụ: ${updated.name} (${id})`);
    return updated;
  }

  async deleteSubscription(id: string): Promise<void> {
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy gói dịch vụ với ID '${id}'`);
    }

    await this.repo.delete(id);
    logger.info(`Đã xóa gói dịch vụ: ${existing.name} (${id})`);
  }
}
