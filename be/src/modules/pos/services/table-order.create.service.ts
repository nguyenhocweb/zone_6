import { TableRepository } from '../../admin_he_thong/table/repositories/table.repository.js';
import { StoreConfigModel } from '../../admin_he_thong/store-config/models/store-config.model.js';
import { OrderModel, IOrder, IOrderItem } from '../models/order.model.js';
import { calculateDistanceMeters } from '../../../core/utils/geofence.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { emitPosEvent } from '../socket/pos.socket.js';

export interface CreateTableOrderPayload {
  token: string;
  customerLat: number;
  customerLng: number;
  customerName?: string;
  items: Array<{
    recipeId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    toppings?: Array<{ name: string; price: number }>;
    notes?: string;
  }>;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentMethod: 'VIETQR' | 'CASH';
}

export class TableOrderCreateService {
  private tableRepo: TableRepository;

  constructor() {
    this.tableRepo = new TableRepository();
  }

  async execute(dto: CreateTableOrderPayload): Promise<IOrder> {
    const table = await this.tableRepo.findByToken(dto.token);
    if (!table || !table.is_active) {
      throw new NotFoundError('Mã QR bàn không hợp lệ hoặc đã bị khóa!');
    }

    const storeConfig = await StoreConfigModel.findById(table.store_id).exec();
    if (!storeConfig || !storeConfig.is_active) {
      throw new NotFoundError('Không tìm thấy thông tin cơ sở của bàn này!');
    }

    if (storeConfig.ordering_mode === 'STAFF_ONLY') {
      throw new ForbiddenError('Cơ sở hiện chỉ phục vụ gọi món tại quầy thông qua nhân viên!');
    }

    // Kiểm tra định vị GPS Geofence
    const allowedRadius = storeConfig.table_geofence_radius_meters || 30;
    const isStrict = storeConfig.is_table_geofence_strict ?? true;
    const distanceMeters = calculateDistanceMeters(
      dto.customerLat,
      dto.customerLng,
      storeConfig.latitude,
      storeConfig.longitude
    );

    if (isStrict && distanceMeters > allowedRadius) {
      throw new ForbiddenError(
        `Định vị của bạn cách quán ${distanceMeters}m (vượt quá bán kính cho phép ${allowedRadius}m). Vui lòng có mặt tại quán để đặt món!`
      );
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError('Giỏ hàng chưa có món nào!');
    }

    // Sinh mã đơn hàng tuần tự
    const storeCode = storeConfig.store_code || 'CS';
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await OrderModel.countDocuments({
      store_id: table.store_id,
      created_at: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
    });
    const seq = String(countToday + 1).padStart(4, '0');
    const orderCode = `Z6-${storeCode}-${dateStr}-${seq}`;

    const formattedItems: IOrderItem[] = dto.items.map((it) => ({
      recipeId: it.recipeId,
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
      toppings: it.toppings || [],
      notes: it.notes || '',
      addedById: 'CUSTOMER',
      addedByName: `Khách Bàn ${table.table_number}`,
    }));

    const order = await OrderModel.create({
      store_id: table.store_id,
      order_code: orderCode,
      table_id: table._id,
      table_number: table.table_number,
      customer_name: dto.customerName || `Khách Bàn ${table.table_number}`,
      order_source: 'CUSTOMER_TABLE_QR',
      customer_lat: dto.customerLat,
      customer_lng: dto.customerLng,
      distance_meters: distanceMeters,
      items: formattedItems,
      total_amount: dto.totalAmount,
      discount_amount: dto.discountAmount || 0,
      final_amount: dto.finalAmount,
      payment_method: dto.paymentMethod || 'VIETQR',
      payment_status: dto.paymentMethod === 'VIETQR' ? 'PENDING' : 'COMPLETED',
      created_by_name: `Khách Bàn ${table.table_number} (QR)`,
    });

    // Cập nhật trạng thái bàn sang OCCUPIED
    await this.tableRepo.update(table._id.toString(), { status: 'OCCUPIED' });

    // Phát sự kiện Socket.io báo động tới toàn bộ nhân viên ca trực
    emitPosEvent(table.store_id.toString(), 'pos:new_table_order', {
      orderId: order._id.toString(),
      orderCode: order.order_code,
      tableNumber: table.table_number,
      customerName: order.customer_name,
      finalAmount: order.final_amount,
      itemsCount: order.items.length,
      createdAt: order.created_at,
    });

    return order;
  }
}
