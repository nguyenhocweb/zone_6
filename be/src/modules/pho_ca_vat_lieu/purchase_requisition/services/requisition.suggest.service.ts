import { MaterialRepository } from '../../material/repositories/material.repository.js';
import { SupplierModel } from '../../../admin_he_thong/supplier/models/supplier.model.js';

export class RequisitionSuggestService {
  private materialRepo: MaterialRepository;

  constructor() {
    this.materialRepo = new MaterialRepository();
  }

  async getSuggestions(storeId?: string) {
    // 1. Lấy toàn bộ nguyên vật liệu của quán
    const materials = await this.materialRepo.findAll({
      store_id: storeId,
      is_active: true,
    });

    // 2. Lấy danh sách các nhà cung cấp đang hoạt động
    const activeSuppliers = await SupplierModel.find({ is_active: true }).lean();

    // 3. Lọc các nguyên vật liệu dưới hoặc bằng ngưỡng an toàn
    const lowStockItems = materials.filter((m) => {
      const stock = m.quantity_in_stock ?? 0;
      const min = m.min_threshold ?? 10;
      return stock <= min;
    });

    // 4. Ánh xạ nhà cung cấp tương ứng và tính lượng gợi ý
    const suggestions = lowStockItems.map((item) => {
      const currentStock = item.quantity_in_stock ?? 0;
      const minThreshold = item.min_threshold ?? 10;
      // Định mức mục tiêu là gấp 2.5 lần ngưỡng an toàn (hoặc tối thiểu 10 đơn vị)
      const targetStock = Math.max(minThreshold * 2.5, minThreshold + 10);
      const suggestedQuantity = Math.max(1, Math.ceil(targetStock - currentStock));

      // Tìm nhà cung cấp có cung cấp mặt hàng này
      let matchedSupplier = activeSuppliers.find((s) =>
        s.supplied_materials?.some(
          (sm: any) =>
            sm.material_id === item.id ||
            sm.material_code?.toUpperCase() === item.code?.toUpperCase()
        )
      );

      // Nếu không tìm thấy đích danh mã, tìm theo danh mục
      if (!matchedSupplier) {
        matchedSupplier = activeSuppliers.find((s) =>
          s.supplied_materials?.some((sm: any) => sm.category === item.category)
        );
      }

      return {
        material_id: item.id || String(item._id),
        material_code: item.code,
        material_name: item.name,
        category: item.category,
        unit: item.unit,
        current_stock: currentStock,
        min_threshold: minThreshold,
        suggested_quantity: suggestedQuantity,
        suggested_supplier_id: matchedSupplier ? String(matchedSupplier._id) : null,
        suggested_supplier_name: matchedSupplier ? matchedSupplier.name : null,
        cost_per_unit: item.cost_per_unit || 0,
        estimated_cost: (item.cost_per_unit || 0) * suggestedQuantity,
      };
    });

    return {
      store_id: storeId,
      total_low_stock_items: suggestions.length,
      suggestions,
    };
  }
}

