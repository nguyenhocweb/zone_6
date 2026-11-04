import mongoose from 'mongoose';
import { SellableToppingModel, type ISellableToppingDoc } from '../models/sellable-topping.model.js';
import { ToppingModel } from '../models/topping.model.js';
import type { SellableToppingCreateDto, SellableToppingUpdateDto } from '../schemas/sellable-topping.schema.js';

export class SellableToppingRepository {
  /**
   * Lấy danh sách tất cả Topping bán ra, kèm dữ liệu tồn kho thực tế từ bảng toppings
   */
  async findAll(filters?: { store_id?: string; is_active?: boolean; search?: string }): Promise<any[]> {
    const conditions: any[] = [];

    if (filters?.store_id) {
      conditions.push({
        $or: [
          { store_id: new mongoose.Types.ObjectId(filters.store_id) },
          { store_id: null },
          { store_id: { $exists: false } },
        ],
      });
    }

    if (filters?.is_active !== undefined) {
      conditions.push({ is_active: filters.is_active });
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      conditions.push({
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { code: { $regex: s, $options: 'i' } },
          { portion_unit: { $regex: s, $options: 'i' } },
        ],
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const items = await SellableToppingModel.find(query).sort({ name: 1 }).exec();

    // Lấy map tồn kho từ bảng kho toppings
    const toppingIds = items.map((i) => i.topping_id).filter(Boolean);
    const stockMap = new Map<string, { qty: number; unit: string; cost: number }>();
    if (toppingIds.length > 0) {
      const warehouseToppings = await ToppingModel.find({ _id: { $in: toppingIds } }).exec();
      warehouseToppings.forEach((t) => {
        stockMap.set(t._id.toString(), {
          qty: t.quantity_in_stock,
          unit: t.unit,
          cost: t.cost_per_unit,
        });
      });
    }

    return items.map((doc) => {
      const tId = doc.topping_id ? doc.topping_id.toString() : '';
      const stockInfo = stockMap.get(tId);
      const cost = doc.cost_estimate || 0;
      const price = doc.selling_price || 0;
      const profit = price - cost;
      const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

      return {
        id: doc._id.toString(),
        store_id: doc.store_id?.toString() || null,
        topping_id: tId || null,
        name: doc.name,
        code: doc.code,
        portion_unit: doc.portion_unit,
        selling_price: price,
        cost_estimate: cost,
        gross_profit_margin: margin,
        stock_quantity: stockInfo?.qty ?? 0,
        stock_unit: stockInfo?.unit ?? 'Khẩu phần',
        description: doc.description || null,
        is_active: doc.is_active,
        created_at: doc.created_at?.toISOString() || new Date().toISOString(),
        updated_at: doc.updated_at?.toISOString() || new Date().toISOString(),
      };
    });
  }

  async findById(id: string): Promise<ISellableToppingDoc | null> {
    return SellableToppingModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<ISellableToppingDoc | null> {
    return SellableToppingModel.findOne({ code: code.trim().toUpperCase() }).exec();
  }

  async findByToppingId(toppingId: string): Promise<ISellableToppingDoc | null> {
    return SellableToppingModel.findOne({ topping_id: toppingId }).exec();
  }

  async create(dto: SellableToppingCreateDto): Promise<ISellableToppingDoc> {
    const code = dto.code?.trim().toUpperCase() || `TOP-${Date.now().toString().slice(-6)}`;
    return SellableToppingModel.create({
      store_id: dto.store_id || null,
      topping_id: dto.topping_id || null,
      name: dto.name.trim(),
      code,
      portion_unit: dto.portion_unit.trim(),
      selling_price: dto.selling_price ?? 0,
      cost_estimate: dto.cost_estimate ?? 0,
      description: dto.description?.trim() || null,
      is_active: dto.is_active ?? true,
    });
  }

  async update(id: string, dto: SellableToppingUpdateDto): Promise<ISellableToppingDoc | null> {
    return SellableToppingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.code && { code: dto.code.trim().toUpperCase() }),
          ...(dto.portion_unit && { portion_unit: dto.portion_unit.trim() }),
          ...(dto.selling_price !== undefined && { selling_price: dto.selling_price }),
          ...(dto.cost_estimate !== undefined && { cost_estimate: dto.cost_estimate }),
          ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
          ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        },
      },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await SellableToppingModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  /**
   * Tự động đồng bộ Topping từ kho sang bảng Topping Bán Ra (SellableTopping)
   */
  async syncFromWarehouseTopping(
    warehouseTopping: {
      _id: any;
      store_id?: any;
      name: string;
      code: string;
      portion_unit?: string | null;
      selling_price?: number;
      cost_per_unit?: number;
      description?: string | null;
      is_active?: boolean;
    }
  ): Promise<ISellableToppingDoc> {
    const existing = await SellableToppingModel.findOne({
      topping_id: warehouseTopping._id,
    }).exec();

    const portionUnit = warehouseTopping.portion_unit?.trim() || '1 phần';
    const sellingPrice = warehouseTopping.selling_price ?? 0;

    if (existing) {
      existing.name = warehouseTopping.name;
      existing.portion_unit = portionUnit;
      existing.selling_price = sellingPrice;
      existing.topping_id = warehouseTopping._id;
      if (warehouseTopping.store_id !== undefined) {
        existing.store_id = warehouseTopping.store_id;
      }
      if (warehouseTopping.description !== undefined) {
        existing.description = warehouseTopping.description;
      }
      return existing.save();
    }

    return SellableToppingModel.create({
      store_id: warehouseTopping.store_id || null,
      topping_id: warehouseTopping._id,
      name: warehouseTopping.name,
      code: warehouseTopping.code,
      portion_unit: portionUnit,
      selling_price: sellingPrice,
      cost_estimate: Math.round((warehouseTopping.cost_per_unit || 0) * 0.05), // Ước tính 5% giá đơn vị kho
      description: warehouseTopping.description || null,
      is_active: warehouseTopping.is_active ?? true,
    });
  }

  /**
   * Khởi tạo dữ liệu mẫu cho bảng Topping Bán Ra nếu chưa có
   */
  async seedInitialSellableToppings(): Promise<void> {
    const count = await SellableToppingModel.countDocuments();
    if (count > 0) return;

    const toppings = await ToppingModel.find().exec();
    for (const t of toppings) {
      let portion = '1 vá';
      let price = 5000;
      let costEst = 1200;

      if (t.name.includes('Đào')) {
        portion = '2 miếng';
        price = 10000;
        costEst = 2500;
      } else if (t.name.includes('Phô Mai') || t.name.includes('Khúc Bạch')) {
        portion = '2 viên';
        price = 8000;
        costEst = 2000;
      } else if (t.name.includes('Hoàng Kim')) {
        portion = '1 vá';
        price = 6000;
        costEst = 1500;
      } else if (t.name.includes('Củ Năng')) {
        portion = '1 vá';
        price = 7000;
        costEst = 1800;
      }

      await SellableToppingModel.create({
        topping_id: t._id,
        name: t.name,
        code: t.code,
        portion_unit: portion,
        selling_price: price,
        cost_estimate: costEst,
        description: `Bán kèm món: ${portion}`,
        is_active: true,
      });

      // Đồng bộ ngược lại cho bản ghi Topping trong kho
      t.portion_unit = portion;
      t.selling_price = price;
      await t.save();
    }
  }
}
