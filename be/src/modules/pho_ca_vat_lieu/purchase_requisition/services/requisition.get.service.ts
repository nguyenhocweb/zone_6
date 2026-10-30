import { PurchaseRequisitionRepository } from '../repositories/purchase-requisition.repository.js';
import { NotFoundError, ForbiddenError } from '../../../../core/errors.js';

export class RequisitionGetService {
  private repo: PurchaseRequisitionRepository;

  constructor() {
    this.repo = new PurchaseRequisitionRepository();
  }

  async getList(
    query: { store_id?: string; status?: string; search?: string; priority?: string },
    currentUser: { id: string; role: string; assigned_store_id?: string; assigned_stores?: string[] }
  ) {
    let effectiveStoreIds: string[] | undefined = undefined;
    let targetStoreId: string | undefined = query.store_id;

    // Ràng buộc phạm vi cơ sở (Store Scope)
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

    const requisitions = await this.repo.findMany({
      store_id: targetStoreId,
      store_ids: effectiveStoreIds,
      status: query.status,
      search: query.search,
      priority: query.priority,
    });

    return {
      total: requisitions.length,
      items: requisitions,
    };
  }

  async getById(
    id: string,
    currentUser: { id: string; role: string; assigned_store_id?: string; assigned_stores?: string[] }
  ) {
    const requisition = await this.repo.findById(id);
    if (!requisition) {
      throw new NotFoundError('Không tìm thấy phiếu yêu cầu nhập kho');
    }

    const storeIdStr = String(requisition.store_id);

    // Kiểm tra quyền truy cập cơ sở
    if (currentUser.role === 'truong_ca' || currentUser.role === 'pho_ca_vat_lieu') {
      if (currentUser.assigned_store_id && storeIdStr !== String(currentUser.assigned_store_id)) {
        throw new ForbiddenError('Bạn không có quyền xem phiếu yêu cầu của cơ sở khác');
      }
    } else if (currentUser.role === 'quan_ly') {
      const allowedStores = currentUser.assigned_stores || [];
      if (currentUser.assigned_store_id) allowedStores.push(currentUser.assigned_store_id);
      if (allowedStores.length > 0 && !allowedStores.includes(storeIdStr)) {
        throw new ForbiddenError('Bạn không có quyền xem phiếu yêu cầu của cơ sở này');
      }
    }

    return requisition;
  }
}
