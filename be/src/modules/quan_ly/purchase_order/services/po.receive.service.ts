import { PurchaseOrderRepository } from '../repositories/purchase-order.repository.js';
import { MaterialRepository } from '../../../pho_ca_vat_lieu/material/repositories/material.repository.js';
import { NotFoundError, BadRequestError } from '../../../../core/errors.js';
import type { IPurchaseOrderDoc } from '../models/purchase-order.model.js';
import type { ReceivePoDto } from '../schemas/purchase-order.schema.js';

export class PoReceiveService {
  private repo: PurchaseOrderRepository;
  private materialRepo: MaterialRepository;

  constructor() {
    this.repo = new PurchaseOrderRepository();
    this.materialRepo = new MaterialRepository();
  }

  async execute(
    id: string,
    dto: ReceivePoDto,
    currentUser: { id: string; role: string; full_name?: string }
  ) {
    const po = await this.repo.findById(id);
    if (!po) {
      throw new NotFoundError('Không tìm thấy đơn thu mua PO');
    }

    if (po.status === 'COMPLETED') {
      throw new BadRequestError('Đơn hàng đã được xác nhận nhập kho hoàn tất');
    }

    if (po.status === 'CANCELLED') {
      throw new BadRequestError('Đơn hàng đã bị hủy, không thể nhập kho');
    }

    const updatedItems = [...po.items];
    const receivedMap = new Map<string, number>();

    dto.received_items.forEach((item) => {
      receivedMap.set(item.material_id, item.received_quantity);
    });

    // 1. Cập nhật tồn kho và cập nhật số lượng đã nhận trong PO
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (receivedMap.has(item.material_id)) {
        const addedQty = receivedMap.get(item.material_id)!;
        if (addedQty > 0) {
          // Tăng tồn kho thực tế của nguyên liệu
          await this.materialRepo.updateStock(item.material_id, addedQty);
          item.received_quantity = (item.received_quantity || 0) + addedQty;
        }
      }
    }

    // 2. Đánh giá trạng thái hoàn thành của đơn hàng
    const allCompleted = updatedItems.every(
      (item) => (item.received_quantity || 0) >= item.ordered_quantity
    );
    const anyReceived = updatedItems.some(
      (item) => (item.received_quantity || 0) > 0
    );

    let newStatus: IPurchaseOrderDoc['status'] = po.status;
    if (allCompleted) {
      newStatus = 'COMPLETED';
    } else if (anyReceived) {
      newStatus = 'PARTIALLY_RECEIVED';
    }

    const updatedPo = await this.repo.updateById(id, {
      status: newStatus,
      items: updatedItems,
      received_at: new Date(),
      received_by_id: currentUser.id,
      received_by_name: currentUser.full_name || 'Nhân sự',
      ...(dto.notes && { notes: dto.notes }),
    });

    return updatedPo;
  }
}
