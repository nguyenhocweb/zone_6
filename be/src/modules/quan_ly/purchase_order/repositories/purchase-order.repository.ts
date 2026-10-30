import mongoose from 'mongoose';
import { PurchaseOrderModel, type IPurchaseOrderDoc } from '../models/purchase-order.model.js';

export class PurchaseOrderRepository {
  async create(data: Partial<IPurchaseOrderDoc>): Promise<IPurchaseOrderDoc> {
    const po = new PurchaseOrderModel(data);
    return po.save();
  }

  async findById(id: string): Promise<IPurchaseOrderDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PurchaseOrderModel.findById(id).lean();
  }

  async findByPoNumber(poNumber: string): Promise<IPurchaseOrderDoc | null> {
    return PurchaseOrderModel.findOne({ po_number: poNumber }).lean();
  }

  async findMany(filters: {
    store_ids?: string[];
    store_id?: string;
    supplier_id?: string;
    status?: string;
    order_type?: string;
    search?: string;
  }): Promise<IPurchaseOrderDoc[]> {
    const query: any = {};

    if (filters.supplier_id && mongoose.Types.ObjectId.isValid(filters.supplier_id)) {
      query.supplier_id = new mongoose.Types.ObjectId(filters.supplier_id);
    }

    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }

    if (filters.order_type && filters.order_type !== 'ALL') {
      query.order_type = filters.order_type;
    }

    if (filters.store_id && mongoose.Types.ObjectId.isValid(filters.store_id)) {
      const sId = new mongoose.Types.ObjectId(filters.store_id);
      query.$or = [{ delivery_store_id: sId }, { 'items.target_store_id': sId }];
    } else if (filters.store_ids && filters.store_ids.length > 0) {
      const validStoreIds = filters.store_ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      query.$or = [
        { delivery_store_id: { $in: validStoreIds } },
        { 'items.target_store_id': { $in: validStoreIds } },
      ];
    }

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      const searchConditions = [
        { po_number: searchRegex },
        { supplier_name: searchRegex },
        { delivery_address: searchRegex },
        { 'items.material_name': searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    return PurchaseOrderModel.find(query).sort({ created_at: -1 }).lean();
  }

  async updateById(id: string, updateData: any): Promise<IPurchaseOrderDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PurchaseOrderModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
  }

  async countToday(datePrefix: string): Promise<number> {
    return PurchaseOrderModel.countDocuments({
      po_number: { $regex: `^PO-${datePrefix}-` },
    });
  }
}

