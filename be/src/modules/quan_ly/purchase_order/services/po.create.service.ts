import mongoose from 'mongoose';
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository.js';
import { PoAggregateService } from './po.aggregate.service.js';
import { PurchaseRequisitionModel } from '../../../pho_ca_vat_lieu/purchase_requisition/models/purchase-requisition.model.js';
import { BadRequestError } from '../../../../core/errors.js';
import type { CreatePoFromRequisitionsDto } from '../schemas/purchase-order.schema.js';

export class PoCreateService {
  private poRepo: PurchaseOrderRepository;
  private aggregateService: PoAggregateService;

  constructor() {
    this.poRepo = new PurchaseOrderRepository();
    this.aggregateService = new PoAggregateService();
  }

  async execute(
    dto: CreatePoFromRequisitionsDto,
    currentUser: { id: string; role: string; full_name?: string }
  ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const createdPOs: any[] = [];
    const usedRequisitionIds = new Set<string>();

    if (dto.groups && dto.groups.length > 0) {
      // 1. Quản lý đã tùy chỉnh các nhóm
      for (let i = 0; i < dto.groups.length; i++) {
        const group = dto.groups[i];
        if (!group.items || group.items.length === 0) continue;

        const count = await this.poRepo.countToday(datePrefix);
        const sequence = String(count + 1 + i).padStart(3, '0');
        const poNumber = `PO-${datePrefix}-${sequence}`;

        const totalCost = group.items.reduce(
          (sum, item) => sum + (item.ordered_quantity * (item.unit_price || 0)),
          0
        );

        const poItems = group.items.map((item) => {
          if (item.requisition_id) {
            usedRequisitionIds.add(item.requisition_id);
          }
          return {
            requisition_id: item.requisition_id || null,
            target_store_id: new mongoose.Types.ObjectId(item.target_store_id),
            target_store_name: item.target_store_name,
            material_id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            category: item.category,
            unit: item.unit,
            ordered_quantity: item.ordered_quantity,
            received_quantity: 0,
            unit_price: item.unit_price || 0,
            subtotal: item.ordered_quantity * (item.unit_price || 0),
          };
        });

        const po = await this.poRepo.create({
          po_number: poNumber,
          order_type: dto.order_type,
          supplier_id: new mongoose.Types.ObjectId(group.supplier_id),
          supplier_name: group.supplier_name,
          created_by_id: new mongoose.Types.ObjectId(currentUser.id),
          created_by_name: currentUser.full_name || 'Quản lý',
          status: 'PENDING',
          delivery_destination: dto.delivery_destination,
          delivery_store_id:
            dto.delivery_destination === 'CENTRAL_HUB' && dto.delivery_store_id
              ? new mongoose.Types.ObjectId(dto.delivery_store_id)
              : null,
          delivery_address: group.delivery_address || dto.delivery_address,
          contact_person: dto.contact_person || null,
          contact_phone: dto.contact_phone || null,
          total_estimated_cost: totalCost,
          expected_arrival_date: dto.expected_arrival_date ? new Date(dto.expected_arrival_date) : null,
          notes: dto.notes || null,
          items: poItems,
        });

        createdPOs.push(po);
      }
    } else {
      // 2. Tự động gom từ Preview
      const preview = await this.aggregateService.previewAggregation(dto.requisition_ids);
      if (preview.groups.length === 0) {
        throw new BadRequestError('Không có mặt hàng nào cần đặt mua từ các phiếu yêu cầu này');
      }

      for (let i = 0; i < preview.groups.length; i++) {
        const group = preview.groups[i];
        if (group.supplier_id === 'unassigned') continue; // Bỏ qua nếu chưa gán NCC

        const count = await this.poRepo.countToday(datePrefix);
        const sequence = String(count + 1 + i).padStart(3, '0');
        const poNumber = `PO-${datePrefix}-${sequence}`;

        const poItems: any[] = [];

        group.items.forEach((item) => {
          item.store_breakdown.forEach((bd) => {
            usedRequisitionIds.add(bd.requisition_id);
            poItems.push({
              requisition_id: bd.requisition_id,
              target_store_id: new mongoose.Types.ObjectId(bd.store_id),
              target_store_name: bd.store_name,
              material_id: item.material_id,
              material_code: item.material_code,
              material_name: item.material_name,
              category: item.category,
              unit: item.unit,
              ordered_quantity: bd.approved_quantity,
              received_quantity: 0,
              unit_price: item.unit_price,
              subtotal: bd.approved_quantity * item.unit_price,
            });
          });
        });

        const po = await this.poRepo.create({
          po_number: poNumber,
          order_type: dto.order_type,
          supplier_id: new mongoose.Types.ObjectId(group.supplier_id),
          supplier_name: group.supplier_name,
          created_by_id: new mongoose.Types.ObjectId(currentUser.id),
          created_by_name: currentUser.full_name || 'Quản lý',
          status: 'PENDING',
          delivery_destination: dto.delivery_destination,
          delivery_store_id:
            dto.delivery_destination === 'CENTRAL_HUB' && dto.delivery_store_id
              ? new mongoose.Types.ObjectId(dto.delivery_store_id)
              : null,
          delivery_address: dto.delivery_address,
          contact_person: dto.contact_person || null,
          contact_phone: dto.contact_phone || null,
          total_estimated_cost: group.total_estimated_amount,
          expected_arrival_date: dto.expected_arrival_date ? new Date(dto.expected_arrival_date) : null,
          notes: dto.notes || null,
          items: poItems,
        });

        createdPOs.push(po);
      }
    }

    // 3. Cập nhật trạng thái các PurchaseRequisition đã được tạo PO
    if (dto.requisition_ids && dto.requisition_ids.length > 0) {
      const validReqIds = dto.requisition_ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      await PurchaseRequisitionModel.updateMany(
        { _id: { $in: validReqIds } },
        {
          $set: {
            status: 'CONVERTED_TO_PO',
            'items.$[].status': 'IN_PO',
          },
        }
      );
    }

    return {
      total_pos_created: createdPOs.length,
      orders: createdPOs,
    };
  }
}
