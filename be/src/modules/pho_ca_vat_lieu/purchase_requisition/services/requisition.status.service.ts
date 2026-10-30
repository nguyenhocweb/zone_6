import { PurchaseRequisitionRepository } from '../repositories/purchase-requisition.repository.js';
import { NotFoundError, BadRequestError } from '../../../../core/errors.js';
import type { UpdateRequisitionStatusDto } from '../schemas/purchase-requisition.schema.js';

export class RequisitionStatusService {
  private repo: PurchaseRequisitionRepository;

  constructor() {
    this.repo = new PurchaseRequisitionRepository();
  }

  async execute(id: string, dto: UpdateRequisitionStatusDto) {
    const requisition = await this.repo.findById(id);
    if (!requisition) {
      throw new NotFoundError('Không tìm thấy phiếu yêu cầu');
    }

    if (requisition.status === 'CONVERTED_TO_PO') {
      throw new BadRequestError('Phiếu yêu cầu đã được tạo thành đơn thu mua PO, không thể thay đổi trạng thái');
    }

    const updatePayload: any = {
      status: dto.status,
    };

    if (dto.status === 'REJECTED') {
      updatePayload.rejection_reason = dto.rejection_reason || 'Không được phê duyệt';
      updatePayload['items.$[].status'] = 'REJECTED';
    } else if (dto.status === 'APPROVED') {
      // Cập nhật approved_quantity cho từng item nếu có
      let updatedItems = [...requisition.items];
      if (dto.approved_items && dto.approved_items.length > 0) {
        const approvedMap = new Map<string, number>();
        dto.approved_items.forEach((item) => approvedMap.set(item.material_id, item.approved_quantity));

        updatedItems = updatedItems.map((item) => {
          const approvedQty = approvedMap.has(item.material_id)
            ? approvedMap.get(item.material_id)!
            : item.requested_quantity;

          return {
            ...item,
            approved_quantity: approvedQty,
            status: approvedQty > 0 ? ('APPROVED' as const) : ('REJECTED' as const),
          };
        });
      } else {
        // Mặc định duyệt nguyên số lượng yêu cầu
        updatedItems = updatedItems.map((item) => ({
          ...item,
          approved_quantity: item.requested_quantity,
          status: 'APPROVED' as const,
        }));
      }

      updatePayload.items = updatedItems;
    }

    const updated = await this.repo.updateById(id, updatePayload);
    return updated;
  }
}
