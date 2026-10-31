import { TableRepository } from '../../admin_he_thong/table/repositories/table.repository.js';
import { StoreConfigModel } from '../../admin_he_thong/store-config/models/store-config.model.js';
import { calculateDistanceMeters } from '../../../core/utils/geofence.js';
import { NotFoundError } from '../../../core/errors.js';

export interface VerifyTableOrderResult {
  is_valid: boolean;
  is_inside: boolean;
  allow_ordering: boolean;
  distance_meters: number;
  allowed_radius_meters: number;
  store: {
    id: string;
    store_name: string;
    store_code?: string;
    address: string;
    phone?: string;
  };
  table: {
    id: string;
    table_number: string;
    zone_name: string;
  };
  message: string;
}

export class TableOrderVerifyService {
  private tableRepo: TableRepository;

  constructor() {
    this.tableRepo = new TableRepository();
  }

  async execute(token: string, customerLat?: number, customerLng?: number): Promise<VerifyTableOrderResult> {
    const table = await this.tableRepo.findByToken(token);
    if (!table || !table.is_active) {
      throw new NotFoundError('Mã QR bàn không hợp lệ hoặc đã bị vô hiệu hóa!');
    }

    const storeConfig = await StoreConfigModel.findById(table.store_id).exec();
    if (!storeConfig || !storeConfig.is_active) {
      throw new NotFoundError('Không tìm thấy thông tin cơ sở của bàn này!');
    }

    const allowedRadius = storeConfig.table_geofence_radius_meters || 30;
    const isStrict = storeConfig.is_table_geofence_strict ?? true;
    const orderingMode = storeConfig.ordering_mode || 'HYBRID';

    let distanceMeters = 0;
    let isInside = true;

    if (customerLat !== undefined && customerLng !== undefined) {
      distanceMeters = calculateDistanceMeters(
        customerLat,
        customerLng,
        storeConfig.latitude,
        storeConfig.longitude
      );
      isInside = distanceMeters <= allowedRadius;
    } else if (isStrict) {
      isInside = false;
    }

    const allowOrdering = isInside && orderingMode !== 'STAFF_ONLY';

    let message = 'Vị trí hợp lệ. Chào mừng bạn đến với Zone Six!';
    if (orderingMode === 'STAFF_ONLY') {
      message = 'Quán hiện chỉ phục vụ gọi món tại quầy. Bạn có thể xem menu tham khảo.';
    } else if (!isInside) {
      message = `Bạn đang ở cách quán ${distanceMeters}m (vượt quá bán kính cho phép ${allowedRadius}m). Vui lòng có mặt tại quán để quét mã gọi món!`;
    }

    return {
      is_valid: true,
      is_inside: isInside,
      allow_ordering: allowOrdering,
      distance_meters: distanceMeters,
      allowed_radius_meters: allowedRadius,
      store: {
        id: storeConfig._id.toString(),
        store_name: storeConfig.store_name,
        store_code: storeConfig.store_code,
        address: storeConfig.address,
        phone: storeConfig.phone,
      },
      table: {
        id: table._id.toString(),
        table_number: table.table_number,
        zone_name: table.zone_name,
      },
      message,
    };
  }
}
