import mongoose from 'mongoose';
import { PurchaseRequisitionModel } from '../../../pho_ca_vat_lieu/purchase_requisition/models/purchase-requisition.model.js';
import { SupplierModel } from '../../../admin_he_thong/supplier/models/supplier.model.js';
import { BadRequestError } from '../../../../core/errors.js';

export interface IAggregatedSupplierGroup {
  supplier_id: string;
  supplier_name: string;
  supplier_phone?: string | null;
  supplier_email?: string | null;
  total_items_count: number;
  total_estimated_amount: number;
  items: Array<{
    material_id: string;
    material_code: string;
    material_name: string;
    category: string;
    unit: string;
    total_quantity: number;
    unit_price: number;
    subtotal: number;
    store_breakdown: Array<{
      requisition_id: string;
      store_id: string;
      store_name: string;
      requested_quantity: number;
      approved_quantity: number;
    }>;
  }>;
}

export class PoAggregateService {
  async previewAggregation(requisitionIds: string[]) {
    if (!requisitionIds || requisitionIds.length === 0) {
      throw new BadRequestError('Danh sách phiếu yêu cầu không được rỗng');
    }

    const objectIds = requisitionIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // 1. Lấy danh sách phiếu yêu cầu
    const requisitions = await PurchaseRequisitionModel.find({
      _id: { $in: objectIds },
    }).lean();

    if (requisitions.length === 0) {
      throw new BadRequestError('Không tìm thấy phiếu yêu cầu hợp lệ nào');
    }

    // 2. Lấy toàn bộ nhà cung cấp đang hoạt động
    const activeSuppliers = await SupplierModel.find({ is_active: true }).lean();

    // 3. Gom nhóm theo Nhà cung cấp
    const supplierGroupsMap = new Map<string, IAggregatedSupplierGroup>();

    // Nhà cung cấp mặc định cho các mục chưa có NCC
    const UNASSIGNED_ID = 'unassigned';
    supplierGroupsMap.set(UNASSIGNED_ID, {
      supplier_id: UNASSIGNED_ID,
      supplier_name: 'Nhà cung cấp chưa phân công (Cần chọn)',
      supplier_phone: null,
      supplier_email: null,
      total_items_count: 0,
      total_estimated_amount: 0,
      items: [],
    });

    for (const req of requisitions) {
      const storeIdStr = String(req.store_id);
      const storeName = req.store_name || 'Chi nhánh';

      for (const item of req.items) {
        if (item.status === 'REJECTED') continue;

        const approvedQty =
          typeof item.approved_quantity === 'number' && item.approved_quantity >= 0
            ? item.approved_quantity
            : item.requested_quantity;

        if (approvedQty <= 0) continue;

        // Tìm NCC
        let supplier = activeSuppliers.find(
          (s: any) => String(s._id) === item.suggested_supplier_id
        );

        if (!supplier) {
          supplier = activeSuppliers.find((s: any) =>
            s.supplied_materials?.some(
              (sm: any) =>
                sm.material_id === item.material_id ||
                sm.material_code?.toUpperCase() === item.material_code?.toUpperCase()
            )
          );
        }

        const supplierKey = supplier ? String(supplier._id) : UNASSIGNED_ID;

        if (!supplierGroupsMap.has(supplierKey) && supplier) {
          supplierGroupsMap.set(supplierKey, {
            supplier_id: String(supplier._id),
            supplier_name: supplier.name,
            supplier_phone: supplier.phone || null,
            supplier_email: supplier.email || null,
            total_items_count: 0,
            total_estimated_amount: 0,
            items: [],
          });
        }

        const group = supplierGroupsMap.get(supplierKey)!;

        // Tìm giá cung cấp nếu có
        let unitPrice = 0;
        if (supplier) {
          const matchedMat = supplier.supplied_materials?.find(
            (sm: any) =>
              sm.material_id === item.material_id ||
              sm.material_code?.toUpperCase() === item.material_code?.toUpperCase()
          );
          if (matchedMat && matchedMat.supply_price) {
            unitPrice = matchedMat.supply_price;
          }
        }

        // Kiểm tra xem mặt hàng đã có trong nhóm NCC này chưa
        const existingItem = group.items.find((i) => i.material_id === item.material_id);

        if (existingItem) {
          existingItem.total_quantity += approvedQty;
          existingItem.subtotal = existingItem.total_quantity * existingItem.unit_price;
          existingItem.store_breakdown.push({
            requisition_id: String(req._id),
            store_id: storeIdStr,
            store_name: storeName,
            requested_quantity: item.requested_quantity,
            approved_quantity: approvedQty,
          });
        } else {
          group.items.push({
            material_id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            category: item.category,
            unit: item.unit,
            total_quantity: approvedQty,
            unit_price: unitPrice,
            subtotal: approvedQty * unitPrice,
            store_breakdown: [
              {
                requisition_id: String(req._id),
                store_id: storeIdStr,
                store_name: storeName,
                requested_quantity: item.requested_quantity,
                approved_quantity: approvedQty,
              },
            ],
          });
        }
      }
    }

    // Tính toán lại tổng tiền và số lượng item cho từng nhóm
    const finalGroups: IAggregatedSupplierGroup[] = [];

    for (const [key, group] of supplierGroupsMap.entries()) {
      if (group.items.length > 0) {
        group.total_items_count = group.items.length;
        group.total_estimated_amount = group.items.reduce((sum, i) => sum + i.subtotal, 0);
        finalGroups.push(group);
      }
    }

    return {
      selected_requisitions_count: requisitions.length,
      requisition_codes: requisitions.map((r: any) => r.code),
      total_supplier_groups: finalGroups.length,
      groups: finalGroups,
    };
  }
}
