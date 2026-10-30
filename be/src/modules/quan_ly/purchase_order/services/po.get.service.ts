import { PurchaseOrderRepository } from '../repositories/purchase-order.repository.js';
import { NotFoundError, ForbiddenError } from '../../../../core/errors.js';

export class PoGetService {
  private repo: PurchaseOrderRepository;

  constructor() {
    this.repo = new PurchaseOrderRepository();
  }

  async getList(
    query: {
      store_id?: string;
      supplier_id?: string;
      status?: string;
      order_type?: string;
      search?: string;
    },
    currentUser: { id: string; role: string; assigned_store_id?: string; assigned_stores?: string[] }
  ) {
    let effectiveStoreIds: string[] | undefined = undefined;
    let targetStoreId: string | undefined = query.store_id;

    if (currentUser.role === 'truong_ca' || currentUser.role === 'pho_ca_vat_lieu') {
      targetStoreId = currentUser.assigned_store_id;
    } else if (currentUser.role === 'quan_ly') {
      const allowedStores = currentUser.assigned_stores || [];
      if (currentUser.assigned_store_id && !allowedStores.includes(currentUser.assigned_store_id)) {
        allowedStores.push(currentUser.assigned_store_id);
      }

      if (query.store_id) {
        if (allowedStores.length > 0 && !allowedStores.includes(query.store_id)) {
          throw new ForbiddenError('Bạn không có quyền truy cập dữ liệu của cơ sở này');
        }
        targetStoreId = query.store_id;
      } else if (allowedStores.length > 0) {
        effectiveStoreIds = allowedStores;
        targetStoreId = undefined;
      }
    }

    const orders = await this.repo.findMany({
      store_id: targetStoreId,
      store_ids: effectiveStoreIds,
      supplier_id: query.supplier_id,
      status: query.status,
      order_type: query.order_type,
      search: query.search,
    });

    return {
      total: orders.length,
      items: orders,
    };
  }

  async getById(
    id: string,
    currentUser: { id: string; role: string; assigned_store_id?: string; assigned_stores?: string[] }
  ) {
    const po = await this.repo.findById(id);
    if (!po) {
      throw new NotFoundError('Không tìm thấy đơn thu mua PO');
    }

    // Kiểm tra quyền cơ sở
    if (currentUser.role === 'truong_ca' || currentUser.role === 'pho_ca_vat_lieu') {
      const isRelated =
        String(po.delivery_store_id) === String(currentUser.assigned_store_id) ||
        po.items.some((i) => String(i.target_store_id) === String(currentUser.assigned_store_id));

      if (!isRelated && currentUser.assigned_store_id) {
        throw new ForbiddenError('Bạn không có quyền xem đơn hàng này');
      }
    }

    return po;
  }
}
