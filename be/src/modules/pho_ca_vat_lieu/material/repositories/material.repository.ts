import mongoose from 'mongoose';
import { PackagingModel, type IPackagingDoc } from '../models/packaging.model.js';
import { IngredientModel, type IIngredientDoc } from '../models/ingredient.model.js';
import { ToppingModel, type IToppingDoc } from '../models/topping.model.js';
import { MaterialModel, type IMaterialDoc } from '../models/material.model.js';
import { SellableToppingRepository } from './sellable-topping.repository.js';
import type { MaterialCreateDto, MaterialUpdateDto } from '../schemas/material.schema.js';

export type UnifiedMaterialItem = {
  _id: any;
  id: string;
  store_id?: any;
  name: string;
  code: string;
  category: 'packaging' | 'ingredient' | 'topping' | string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  temperature_mode?: string;
  cup_size?: string | null;
  usage_scope?: string;
  portion_unit?: string | null;
  selling_price?: number;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export class MaterialRepository {
  /**
   * Truy vấn danh sách từ 3 table chuyên biệt: packagings, ingredients, toppings
   */
  async findAll(filters?: {
    category?: string;
    search?: string;
    is_active?: boolean;
    store_id?: string;
    usage_scope?: string;
  }): Promise<UnifiedMaterialItem[]> {
    const buildQuery = (extra: any = {}) => {
      const q: any = { ...extra };
      if (filters?.store_id) {
        q.store_id = new mongoose.Types.ObjectId(filters.store_id);
      }
      if (filters?.is_active !== undefined) {
        q.is_active = filters.is_active;
      }
      if (filters?.search && filters.search.trim()) {
        const s = filters.search.trim();
        q.$or = [
          { name: { $regex: s, $options: 'i' } },
          { code: { $regex: s, $options: 'i' } },
        ];
      }
      return q;
    };

    const targetCategory = filters?.category || 'all';
    let results: UnifiedMaterialItem[] = [];

    // 1. Table packagings
    if (targetCategory === 'all' || targetCategory === 'packaging') {
      const pkgs = await PackagingModel.find(buildQuery()).sort({ name: 1 }).exec();
      results.push(
        ...pkgs.map((p) => ({
          ...p.toObject(),
          id: p._id.toString(),
          category: 'packaging' as const,
        }))
      );
    }

    // 2. Table ingredients (có lọc theo usage_scope)
    if (targetCategory === 'all' || targetCategory === 'ingredient') {
      const ingredientExtra: any = {};
      if (filters?.usage_scope && filters.usage_scope !== 'all') {
        ingredientExtra.usage_scope = filters.usage_scope;
      }
      const ings = await IngredientModel.find(buildQuery(ingredientExtra)).sort({ name: 1 }).exec();
      results.push(
        ...ings.map((i) => ({
          ...i.toObject(),
          id: i._id.toString(),
          category: 'ingredient' as const,
        }))
      );
    }

    // 3. Table toppings
    if (targetCategory === 'all' || targetCategory === 'topping') {
      const tops = await ToppingModel.find(buildQuery()).sort({ name: 1 }).exec();
      results.push(
        ...tops.map((t) => ({
          ...t.toObject(),
          id: t._id.toString(),
          category: 'topping' as const,
        }))
      );
    }

    return results;
  }

  async findById(id: string): Promise<UnifiedMaterialItem | null> {
    // Thử tìm lần lượt trong 3 table
    const pkg = await PackagingModel.findById(id).exec();
    if (pkg) {
      return { ...pkg.toObject(), id: pkg._id.toString(), category: 'packaging' };
    }

    const ing = await IngredientModel.findById(id).exec();
    if (ing) {
      return { ...ing.toObject(), id: ing._id.toString(), category: 'ingredient' };
    }

    const top = await ToppingModel.findById(id).exec();
    if (top) {
      return { ...top.toObject(), id: top._id.toString(), category: 'topping' };
    }

    // Fallback bảng cũ
    const mat = await MaterialModel.findById(id).exec();
    if (mat) {
      return { ...mat.toObject(), id: mat._id.toString(), category: mat.category };
    }

    return null;
  }

  async findByCode(code: string): Promise<UnifiedMaterialItem | null> {
    const formattedCode = code.trim().toUpperCase();

    const pkg = await PackagingModel.findOne({ code: formattedCode }).exec();
    if (pkg) return { ...pkg.toObject(), id: pkg._id.toString(), category: 'packaging' };

    const ing = await IngredientModel.findOne({ code: formattedCode }).exec();
    if (ing) return { ...ing.toObject(), id: ing._id.toString(), category: 'ingredient' };

    const top = await ToppingModel.findOne({ code: formattedCode }).exec();
    if (top) return { ...top.toObject(), id: top._id.toString(), category: 'topping' };

    const mat = await MaterialModel.findOne({ code: formattedCode }).exec();
    if (mat) return { ...mat.toObject(), id: mat._id.toString(), category: mat.category };

    return null;
  }

  async findByName(name: string): Promise<UnifiedMaterialItem | null> {
    const trimmed = name.trim();
    const reg = { $regex: `^${trimmed}$`, $options: 'i' };

    const pkg = await PackagingModel.findOne({ name: reg }).exec();
    if (pkg) return { ...pkg.toObject(), id: pkg._id.toString(), category: 'packaging' };

    const ing = await IngredientModel.findOne({ name: reg }).exec();
    if (ing) return { ...ing.toObject(), id: ing._id.toString(), category: 'ingredient' };

    const top = await ToppingModel.findOne({ name: reg }).exec();
    if (top) return { ...top.toObject(), id: top._id.toString(), category: 'topping' };

    const mat = await MaterialModel.findOne({ name: reg }).exec();
    if (mat) return { ...mat.toObject(), id: mat._id.toString(), category: mat.category };

    return null;
  }

  /**
   * Tạo bản ghi mới trực tiếp vào table tương ứng
   */
  async create(dto: MaterialCreateDto): Promise<UnifiedMaterialItem> {
    const baseData = {
      store_id: dto.store_id || null,
      name: dto.name.trim(),
      code: dto.code?.trim().toUpperCase(),
      unit: dto.unit.trim(),
      cost_per_unit: dto.cost_per_unit ?? 0,
      quantity_in_stock: dto.quantity_in_stock ?? 0,
      min_threshold: dto.min_threshold ?? 10,
      description: dto.description?.trim() || null,
      is_active: dto.is_active ?? true,
    };

    if (dto.category === 'packaging') {
      const created = await PackagingModel.create({
        ...baseData,
        temperature_mode: dto.temperature_mode || 'both',
        cup_size: dto.cup_size?.trim() || null,
      });
      return { ...created.toObject(), id: created._id.toString(), category: 'packaging' };
    }

    if (dto.category === 'ingredient') {
      const created = await IngredientModel.create({
        ...baseData,
        usage_scope: dto.usage_scope || 'both',
      });
      return { ...created.toObject(), id: created._id.toString(), category: 'ingredient' };
    }

    if (dto.category === 'topping') {
      const created = await ToppingModel.create({
        ...baseData,
        portion_unit: dto.portion_unit?.trim() || '1 phần',
        selling_price: dto.selling_price ?? 0,
      });

      // Đồng bộ sang bảng CSDL riêng sellable_toppings
      const sellableRepo = new SellableToppingRepository();
      await sellableRepo.syncFromWarehouseTopping({
        _id: created._id,
        store_id: created.store_id,
        name: created.name,
        code: created.code,
        portion_unit: created.portion_unit,
        selling_price: created.selling_price,
        cost_per_unit: created.cost_per_unit,
        description: created.description,
        is_active: created.is_active,
      });

      return { ...created.toObject(), id: created._id.toString(), category: 'topping' };
    }

    // Default fallback
    const created = await MaterialModel.create({
      ...baseData,
      category: dto.category,
      temperature_mode: dto.temperature_mode || 'both',
    });
    return { ...created.toObject(), id: created._id.toString(), category: dto.category };
  }

  /**
   * Cập nhật bản ghi trong table tương ứng
   */
  async update(id: string, dto: MaterialUpdateDto): Promise<UnifiedMaterialItem | null> {
    const updateSet: any = {
      ...(dto.name && { name: dto.name.trim() }),
      ...(dto.code && { code: dto.code.trim().toUpperCase() }),
      ...(dto.unit && { unit: dto.unit.trim() }),
      ...(dto.cost_per_unit !== undefined && { cost_per_unit: dto.cost_per_unit }),
      ...(dto.quantity_in_stock !== undefined && { quantity_in_stock: dto.quantity_in_stock }),
      ...(dto.min_threshold !== undefined && { min_threshold: dto.min_threshold }),
      ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
      ...(dto.is_active !== undefined && { is_active: dto.is_active }),
    };

    // 1. Thử cập nhật Packaging
    const updatedPkg = await PackagingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateSet,
          ...(dto.temperature_mode && { temperature_mode: dto.temperature_mode }),
          ...(dto.cup_size !== undefined && { cup_size: dto.cup_size?.trim() || null }),
        },
      },
      { new: true }
    ).exec();
    if (updatedPkg) return { ...updatedPkg.toObject(), id: updatedPkg._id.toString(), category: 'packaging' };

    // 2. Thử cập nhật Ingredient
    const updatedIng = await IngredientModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateSet,
          ...(dto.usage_scope && { usage_scope: dto.usage_scope }),
        },
      },
      { new: true }
    ).exec();
    if (updatedIng) return { ...updatedIng.toObject(), id: updatedIng._id.toString(), category: 'ingredient' };

    // 3. Thử cập nhật Topping
    const updatedTop = await ToppingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateSet,
          ...(dto.portion_unit !== undefined && { portion_unit: dto.portion_unit?.trim() || '1 phần' }),
          ...(dto.selling_price !== undefined && { selling_price: dto.selling_price }),
        },
      },
      { new: true }
    ).exec();
    if (updatedTop) {
      // Đồng bộ sang bảng CSDL riêng sellable_toppings
      const sellableRepo = new SellableToppingRepository();
      await sellableRepo.syncFromWarehouseTopping({
        _id: updatedTop._id,
        store_id: updatedTop.store_id,
        name: updatedTop.name,
        code: updatedTop.code,
        portion_unit: updatedTop.portion_unit,
        selling_price: updatedTop.selling_price,
        cost_per_unit: updatedTop.cost_per_unit,
        description: updatedTop.description,
        is_active: updatedTop.is_active,
      });

      return { ...updatedTop.toObject(), id: updatedTop._id.toString(), category: 'topping' };
    }

    // Fallback bảng cũ
    const updatedMat = await MaterialModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateSet,
          ...(dto.temperature_mode && { temperature_mode: dto.temperature_mode }),
        },
      },
      { new: true }
    ).exec();
    if (updatedMat) return { ...updatedMat.toObject(), id: updatedMat._id.toString(), category: updatedMat.category };

    return null;
  }

  /**
   * Cập nhật tồn kho nhanh (+ / -)
   */
  async updateStock(id: string, delta: number): Promise<UnifiedMaterialItem | null> {
    const pkg = await PackagingModel.findByIdAndUpdate(
      id,
      { $inc: { quantity_in_stock: delta } },
      { new: true }
    ).exec();
    if (pkg) return { ...pkg.toObject(), id: pkg._id.toString(), category: 'packaging' };

    const ing = await IngredientModel.findByIdAndUpdate(
      id,
      { $inc: { quantity_in_stock: delta } },
      { new: true }
    ).exec();
    if (ing) return { ...ing.toObject(), id: ing._id.toString(), category: 'ingredient' };

    const top = await ToppingModel.findByIdAndUpdate(
      id,
      { $inc: { quantity_in_stock: delta } },
      { new: true }
    ).exec();
    if (top) return { ...top.toObject(), id: top._id.toString(), category: 'topping' };

    const mat = await MaterialModel.findByIdAndUpdate(
      id,
      { $inc: { quantity_in_stock: delta } },
      { new: true }
    ).exec();
    if (mat) return { ...mat.toObject(), id: mat._id.toString(), category: mat.category };

    return null;
  }

  async delete(id: string): Promise<boolean> {
    const r1 = await PackagingModel.findByIdAndDelete(id).exec();
    if (r1) return true;

    const r2 = await IngredientModel.findByIdAndDelete(id).exec();
    if (r2) return true;

    const r3 = await ToppingModel.findByIdAndDelete(id).exec();
    if (r3) return true;

    const r4 = await MaterialModel.findByIdAndDelete(id).exec();
    return !!r4;
  }

  async countTotal(store_id?: string): Promise<number> {
    const filter: any = store_id ? { store_id: new mongoose.Types.ObjectId(store_id) } : {};
    const [c1, c2, c3] = await Promise.all([
      PackagingModel.countDocuments(filter).exec(),
      IngredientModel.countDocuments(filter).exec(),
      ToppingModel.countDocuments(filter).exec(),
    ]);
    return c1 + c2 + c3;
  }

  async countByCategory(category: string, store_id?: string): Promise<number> {
    const filter: any = store_id ? { store_id: new mongoose.Types.ObjectId(store_id) } : {};
    if (category === 'packaging') return PackagingModel.countDocuments(filter).exec();
    if (category === 'ingredient') return IngredientModel.countDocuments(filter).exec();
    if (category === 'topping') return ToppingModel.countDocuments(filter).exec();
    return 0;
  }

  async countLowStock(store_id?: string): Promise<number> {
    const expr: any = {
      $expr: { $lte: ['$quantity_in_stock', '$min_threshold'] },
      is_active: true,
      ...(store_id && { store_id: new mongoose.Types.ObjectId(store_id) }),
    };
    const [c1, c2, c3] = await Promise.all([
      PackagingModel.countDocuments(expr).exec(),
      IngredientModel.countDocuments(expr).exec(),
      ToppingModel.countDocuments(expr).exec(),
    ]);
    return c1 + c2 + c3;
  }

  /**
   * Khởi tạo dữ liệu mẫu và đồng bộ vào 3 table riêng biệt: packagings, ingredients, toppings
   */
  async seedInitialMaterials(): Promise<void> {
    const pkgCount = await PackagingModel.countDocuments().exec();
    const ingCount = await IngredientModel.countDocuments().exec();
    const topCount = await ToppingModel.countDocuments().exec();

    // 1. Seed Table `packagings`
    if (pkgCount === 0) {
      await PackagingModel.insertMany([
        {
          name: 'Ly nhựa PP 500ml (Size M)',
          code: 'MAT-LY-500',
          temperature_mode: 'cold',
          unit: 'Cái',
          cost_per_unit: 450,
          quantity_in_stock: 500,
          min_threshold: 100,
          description: 'Ly nhựa dùng cho đồ uống đá size M (Cà phê muối, Trà đào)',
          is_active: true,
        },
        {
          name: 'Ly nhựa PP 700ml (Size L)',
          code: 'MAT-LY-700',
          temperature_mode: 'cold',
          unit: 'Cái',
          cost_per_unit: 550,
          quantity_in_stock: 800,
          min_threshold: 150,
          description: 'Ly nhựa cao cấp size L dùng đồ lạnh (Trà dâu, Trà đào cam sả)',
          is_active: true,
        },
        {
          name: 'Ly giấy nóng 2 lớp 350ml (12oz)',
          code: 'MAT-LY-HOT-350',
          temperature_mode: 'hot',
          unit: 'Cái',
          cost_per_unit: 650,
          quantity_in_stock: 400,
          min_threshold: 80,
          description: 'Ly giấy 2 lớp chịu nhiệt chuyên dụng đồ uống nóng (Cà phê nóng, Cacao nóng)',
          is_active: true,
        },
        {
          name: 'Ly giấy nóng 2 lớp 500ml (16oz)',
          code: 'MAT-LY-HOT-500',
          temperature_mode: 'hot',
          unit: 'Cái',
          cost_per_unit: 800,
          quantity_in_stock: 350,
          min_threshold: 80,
          description: 'Ly giấy cách nhiệt size lớn cho đồ uống nóng (Trà hoa cúc, Trà gừng sả nóng)',
          is_active: true,
        },
        {
          name: 'Nắp bằng phi 95',
          code: 'MAT-NAP-BANG',
          temperature_mode: 'both',
          unit: 'Cái',
          cost_per_unit: 150,
          quantity_in_stock: 1000,
          min_threshold: 200,
          description: 'Nắp phẳng dùng kèm ly 500ml và 700ml',
          is_active: true,
        },
        {
          name: 'Nắp cầu phi 95',
          code: 'MAT-NAP-CAU',
          temperature_mode: 'cold',
          unit: 'Cái',
          cost_per_unit: 180,
          quantity_in_stock: 600,
          min_threshold: 150,
          description: 'Nắp vòm cầu dùng cho món có lớp kem cheese/macchiato',
          is_active: true,
        },
        {
          name: 'Ống hút phi 8 bọc màng',
          code: 'MAT-ONG-HUT',
          temperature_mode: 'both',
          unit: 'Cái',
          cost_per_unit: 80,
          quantity_in_stock: 1200,
          min_threshold: 200,
          description: 'Ống hút dùng cho trà trái cây, đóng màng tiệt trùng',
          is_active: true,
        },
        {
          name: 'Túi chữ T 1 ly',
          code: 'MAT-TUI-CHU-T',
          temperature_mode: 'both',
          unit: 'Cái',
          cost_per_unit: 90,
          quantity_in_stock: 1000,
          min_threshold: 100,
          description: 'Túi quai xách mang đi chữ T chống nghiêng đổ ly',
          is_active: true,
        },
      ]);
    }

    // 2. Seed Table `ingredients` (kèm usage_scope: customer_product | internal_prep | both)
    if (ingCount === 0) {
      await IngredientModel.insertMany([
        {
          name: 'Đường cát trắng Biên Hòa',
          code: 'MAT-DUONG-CAT',
          usage_scope: 'both',
          unit: 'Kg',
          cost_per_unit: 22000,
          quantity_in_stock: 50,
          min_threshold: 10,
          description: 'Dùng nấu nước đường nền và dầm trái cây trực tiếp',
          is_active: true,
        },
        {
          name: 'Trà đen Lộc Phát',
          code: 'MAT-TRA-DEN',
          usage_scope: 'both',
          unit: 'Kg',
          cost_per_unit: 160000,
          quantity_in_stock: 15,
          min_threshold: 3,
          description: 'Cốt trà chính cho Trà Dâu và Trà Sữa Zone 6',
          is_active: true,
        },
        {
          name: 'Trà sen Bảo Lộc',
          code: 'MAT-TRA-SEN',
          usage_scope: 'customer_product',
          unit: 'Kg',
          cost_per_unit: 180000,
          quantity_in_stock: 10,
          min_threshold: 2,
          description: 'Dùng pha Trà Đào Cam Sả tươi phục vụ khách',
          is_active: true,
        },
        {
          name: 'Mứt Dâu Tây Berrino',
          code: 'MAT-MUT-DAU',
          usage_scope: 'customer_product',
          unit: 'Hộp',
          cost_per_unit: 85000,
          quantity_in_stock: 12,
          min_threshold: 3,
          description: 'Hộp 1kg có xác dâu tươi nguyên miếng pha món bán khách',
          is_active: true,
        },
        {
          name: 'Siro Dâu Tây Golden Farm',
          code: 'MAT-SIRO-DAU',
          usage_scope: 'customer_product',
          unit: 'Chai',
          cost_per_unit: 65000,
          quantity_in_stock: 8,
          min_threshold: 2,
          description: 'Chai 520ml tạo màu hồng tự nhiên cho trà dâu',
          is_active: true,
        },
        {
          name: 'Sữa tươi Dalat Milk không đường',
          code: 'MAT-SUA-TUOI',
          usage_scope: 'both',
          unit: 'Lít',
          cost_per_unit: 34000,
          quantity_in_stock: 30,
          min_threshold: 8,
          description: 'Dùng đánh kem cheese hoặc pha trà sữa trực tiếp',
          is_active: true,
        },
        {
          name: 'Sữa đặc Ngôi Sao Phương Nam',
          code: 'MAT-SUA-DAC',
          usage_scope: 'both',
          unit: 'Hộp',
          cost_per_unit: 68000,
          quantity_in_stock: 24,
          min_threshold: 5,
          description: 'Hộp 1.284kg pha cà phê muối và tạo ngọt béo',
          is_active: true,
        },
        {
          name: 'Cà phê hạt Blend Zone 6',
          code: 'MAT-CA-PHE',
          usage_scope: 'both',
          unit: 'Kg',
          cost_per_unit: 220000,
          quantity_in_stock: 20,
          min_threshold: 5,
          description: '70% Robusta & 30% Arabica thơm đượm',
          is_active: true,
        },
        {
          name: 'Kem béo thực vật Rich’s Non-Dairy',
          code: 'MAT-KEM-BEO',
          usage_scope: 'internal_prep',
          unit: 'Hộp',
          cost_per_unit: 32000,
          quantity_in_stock: 15,
          min_threshold: 4,
          description: 'Chuyên dụng sơ chế kem cheese / foam macchiato',
          is_active: true,
        },
      ]);
    }

    // 3. Seed Table `toppings`
    if (topCount === 0) {
      await ToppingModel.insertMany([
        {
          name: 'Trân châu trắng 3Q giòn',
          code: 'TOP-TC-TRANG',
          unit: 'Bao',
          portion_unit: '1 vá',
          selling_price: 5000,
          cost_per_unit: 55000,
          quantity_in_stock: 15,
          min_threshold: 3,
          description: 'Bao 2kg trân châu ngâm sẵn giòn dai',
          is_active: true,
        },
        {
          name: 'Trân châu đen hoàng kim',
          code: 'TOP-TC-DEN',
          unit: 'Gói',
          portion_unit: '1 vá',
          selling_price: 6000,
          cost_per_unit: 45000,
          quantity_in_stock: 20,
          min_threshold: 4,
          description: 'Gói 1kg nấu cùng đường đen',
          is_active: true,
        },
        {
          name: 'Thạch củ năng giòn lá dứa',
          code: 'TOP-THACH-NANG',
          unit: 'Hộp',
          portion_unit: '1 vá',
          selling_price: 7000,
          cost_per_unit: 65000,
          quantity_in_stock: 10,
          min_threshold: 2,
          description: 'Thạch củ năng bọc bột năng thanh mát',
          is_active: true,
        },
        {
          name: 'Đào ngâm miếng giòn Cronos',
          code: 'TOP-DAO-NGAM',
          unit: 'Lon',
          portion_unit: '2 miếng',
          selling_price: 10000,
          cost_per_unit: 48000,
          quantity_in_stock: 25,
          min_threshold: 5,
          description: 'Lon 820g topping kèm Trà Đào Cam Sả',
          is_active: true,
        },
      ]);
    }

    // 4. Cập nhật dữ liệu cũ nếu thiếu trường mới
    await PackagingModel.updateMany({ code: 'MAT-LY-500', cup_size: null }, { $set: { cup_size: 'Size M (500ml)' } });
    await PackagingModel.updateMany({ code: 'MAT-LY-700', cup_size: null }, { $set: { cup_size: 'Size L (700ml)' } });
    await PackagingModel.updateMany({ code: 'MAT-LY-HOT-350', cup_size: null }, { $set: { cup_size: 'Size S (350ml)' } });
    await PackagingModel.updateMany({ code: 'MAT-LY-HOT-500', cup_size: null }, { $set: { cup_size: 'Size M (500ml)' } });

    await ToppingModel.updateMany({ code: 'TOP-TC-TRANG', portion_unit: null }, { $set: { portion_unit: '1 vá', selling_price: 5000 } });
    await ToppingModel.updateMany({ code: 'TOP-TC-DEN', portion_unit: null }, { $set: { portion_unit: '1 vá', selling_price: 6000 } });
    await ToppingModel.updateMany({ code: 'TOP-THACH-NANG', portion_unit: null }, { $set: { portion_unit: '1 vá', selling_price: 7000 } });
    await ToppingModel.updateMany({ code: 'TOP-DAO-NGAM', portion_unit: null }, { $set: { portion_unit: '2 miếng', selling_price: 10000 } });

    // 5. Khởi tạo bảng CSDL riêng sellable_toppings
    const sellableRepo = new SellableToppingRepository();
    await sellableRepo.seedInitialSellableToppings();
  }
}
