import { RecipeCategoryModel, type IRecipeCategoryDoc } from '../models/recipe-category.model.js';
import type { RecipeCategoryCreateDto } from '../schemas/recipe-category.schema.js';

export class RecipeCategoryRepository {
  async findAll(filters?: {
    type?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<IRecipeCategoryDoc[]> {
    const query: any = {};

    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters?.type && filters.type !== 'all') {
      query.$or = [{ type: filters.type }, { type: 'both' }];
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
      ];
    }

    const count = await RecipeCategoryModel.countDocuments();
    if (count === 0) {
      await this.seedInitialCategories();
    }

    return RecipeCategoryModel.find(query).sort({ type: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<IRecipeCategoryDoc | null> {
    return RecipeCategoryModel.findById(id).exec();
  }

  async findByName(name: string): Promise<IRecipeCategoryDoc | null> {
    return RecipeCategoryModel.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    }).exec();
  }

  async create(dto: RecipeCategoryCreateDto): Promise<IRecipeCategoryDoc> {
    const code =
      dto.code?.trim().toUpperCase() ||
      `CAT-${Date.now().toString().slice(-6)}`;

    return RecipeCategoryModel.create({
      name: dto.name.trim(),
      code,
      description: dto.description?.trim() || null,
      type: dto.type || 'both',
      is_active: dto.is_active ?? true,
    });
  }

  async findOrCreate(name: string, type: string = 'both'): Promise<IRecipeCategoryDoc> {
    const trimmed = name.trim();
    let category = await this.findByName(trimmed);
    if (!category) {
      const generatedCode = `CAT-${trimmed
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 10)}-${Date.now().toString().slice(-4)}`;

      category = await RecipeCategoryModel.create({
        name: trimmed,
        code: generatedCode,
        description: `Danh mục tạo tự động: ${trimmed}`,
        type: type === 'internal_prep' ? 'internal_prep' : 'customer_product',
        is_active: true,
      });
    }
    return category as IRecipeCategoryDoc;
  }

  async seedInitialCategories(): Promise<void> {
    const initialCategories = [
      {
        name: 'Trà trái cây',
        code: 'CAT-TRA-TC',
        description: 'Các món trà hoa quả tươi, thanh nhiệt mát lạnh',
        type: 'customer_product',
        is_active: true,
      },
      {
        name: 'Cà phê',
        code: 'CAT-CA-PHE',
        description: 'Cà phê truyền thống phin đậm vị, cà phê muối',
        type: 'customer_product',
        is_active: true,
      },
      {
        name: 'Trà sữa',
        code: 'CAT-TRA-SUA',
        description: 'Trà sữa olong, trà sữa kem cheese, trà sữa truyền thống',
        type: 'customer_product',
        is_active: true,
      },
      {
        name: 'Đá xay - Matcha',
        code: 'CAT-DA-XAY',
        description: 'Matcha đá xay, cookie đá xay quầy bar',
        type: 'customer_product',
        is_active: true,
      },
      {
        name: 'Bán thành phẩm nội bộ',
        code: 'CAT-NOI-BO',
        description: 'Nước đường, cốt trà ủ, kem cheese đánh sẵn chỉ nhân viên thấy',
        type: 'internal_prep',
        is_active: true,
      },
      {
        name: 'Cốt trà & Syrup sơ chế',
        code: 'CAT-SO-CHE',
        description: 'Quy trình sơ chế syrup ngâm và ủ cốt trà nền',
        type: 'internal_prep',
        is_active: true,
      },
    ];

    for (const cat of initialCategories) {
      const existing = await RecipeCategoryModel.findOne({
        name: { $regex: `^${cat.name}$`, $options: 'i' },
      });
      if (!existing) {
        await RecipeCategoryModel.create(cat);
      }
    }
  }
}
