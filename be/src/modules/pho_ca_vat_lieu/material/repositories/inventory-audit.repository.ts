import mongoose from 'mongoose';
import {
  InventoryAuditModel,
  type IInventoryAuditDoc,
} from '../models/inventory-audit.model.js';
import { PackagingModel } from '../models/packaging.model.js';
import { IngredientModel } from '../models/ingredient.model.js';
import { ToppingModel } from '../models/topping.model.js';

export class InventoryAuditRepository {
  async create(data: Partial<IInventoryAuditDoc>): Promise<IInventoryAuditDoc> {
    return await InventoryAuditModel.create(data);
  }

  async findAll(filter: { store_id?: string; status?: string; date?: string } = {}): Promise<IInventoryAuditDoc[]> {
    const query: Record<string, any> = {};
    if (filter.store_id) {
      query.store_id = new mongoose.Types.ObjectId(filter.store_id);
    }
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.date) {
      const startOfDay = new Date(filter.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filter.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.created_at = { $gte: startOfDay, $lte: endOfDay };
    }
    return await InventoryAuditModel.find(query).sort({ created_at: -1 }).lean();
  }

  async findById(id: string): Promise<IInventoryAuditDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await InventoryAuditModel.findById(id).lean();
  }

  async update(id: string, data: Partial<IInventoryAuditDoc>): Promise<IInventoryAuditDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await InventoryAuditModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
  }

  async countTodayAudits(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await InventoryAuditModel.countDocuments({
      created_at: { $gte: today, $lt: tomorrow },
    });
  }

  async findLatestAudit(storeId?: string | null): Promise<IInventoryAuditDoc | null> {
    const filter: Record<string, any> = {};
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      filter.store_id = new mongoose.Types.ObjectId(storeId);
    }
    return await InventoryAuditModel.findOne(filter).sort({ created_at: -1 }).lean();
  }

  async findTodayAudits(storeId?: string | null): Promise<IInventoryAuditDoc[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filter: Record<string, any> = {
      created_at: { $gte: today, $lt: tomorrow },
    };
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      filter.store_id = new mongoose.Types.ObjectId(storeId);
    }
    return await InventoryAuditModel.find(filter).lean();
  }

  async updateMaterialStock(
    category: 'packaging' | 'ingredient' | 'topping',
    materialId: string,
    actualQuantity: number
  ): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(materialId)) return;

    if (category === 'packaging') {
      await PackagingModel.findByIdAndUpdate(materialId, {
        $set: { quantity_in_stock: actualQuantity },
      });
    } else if (category === 'ingredient') {
      await IngredientModel.findByIdAndUpdate(materialId, {
        $set: { quantity_in_stock: actualQuantity },
      });
    } else if (category === 'topping') {
      await ToppingModel.findByIdAndUpdate(materialId, {
        $set: { quantity_in_stock: actualQuantity },
      });
    }
  }
}
