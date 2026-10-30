import mongoose from 'mongoose';
import { PurchaseRequisitionModel, type IPurchaseRequisitionDoc } from '../models/purchase-requisition.model.js';

export class PurchaseRequisitionRepository {
  async create(data: Partial<IPurchaseRequisitionDoc>): Promise<IPurchaseRequisitionDoc> {
    const requisition = new PurchaseRequisitionModel(data);
    return requisition.save();
  }

  async findById(id: string): Promise<IPurchaseRequisitionDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PurchaseRequisitionModel.findById(id).lean();
  }

  async findByCode(code: string): Promise<IPurchaseRequisitionDoc | null> {
    return PurchaseRequisitionModel.findOne({ code }).lean();
  }

  async findMany(filters: {
    store_ids?: string[];
    store_id?: string;
    status?: string;
    search?: string;
    priority?: string;
  }): Promise<IPurchaseRequisitionDoc[]> {
    const query: any = {};

    if (filters.store_id && mongoose.Types.ObjectId.isValid(filters.store_id)) {
      query.store_id = new mongoose.Types.ObjectId(filters.store_id);
    } else if (filters.store_ids && filters.store_ids.length > 0) {
      query.store_id = {
        $in: filters.store_ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.search) {
      query.$or = [
        { code: { $regex: filters.search, $options: 'i' } },
        { store_name: { $regex: filters.search, $options: 'i' } },
        { creator_name: { $regex: filters.search, $options: 'i' } },
        { 'items.material_name': { $regex: filters.search, $options: 'i' } },
      ];
    }

    return PurchaseRequisitionModel.find(query).sort({ created_at: -1 }).lean();
  }

  async updateById(id: string, updateData: any): Promise<IPurchaseRequisitionDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PurchaseRequisitionModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
  }

  async countToday(datePrefix: string): Promise<number> {
    return PurchaseRequisitionModel.countDocuments({
      code: { $regex: `^PR-${datePrefix}-` },
    });
  }
}

