import { StoreConfigModel, type IStoreConfigDoc } from '../models/store-config.model.js';
import type { StoreConfigUpdateDto, StoreConfigResponse } from '../schemas/store-config.schema.js';
import { calculateDistanceMeters } from '../../../core/utils/geofence.js';
import { ForbiddenError, NotFoundError } from '../../../core/errors.js';

export class StoreConfigService {
  /**
   * Lấy cấu hình check-in & định vị quán hiện tại.
   * Nếu chưa có trong MongoDB, tự động tạo cấu hình mặc định cho Zone 6.
   */
  async getConfig(): Promise<StoreConfigResponse> {
    let config = await StoreConfigModel.findOne().exec();

    if (!config) {
      config = await StoreConfigModel.create({
        store_name: 'Zone Six Cafe & Lounge',
        address: '214 Lê Ninh, Phường Quán Bàu, TP Vinh',
        latitude: 18.679584,
        longitude: 105.681329,
        geofence_radius_meters: 100,
        allowed_checkin_before_minutes: 30,
        allowed_checkin_after_minutes: 30,
        is_geofence_required: true,
        is_time_window_strict: true,
      });
    }

    return this.mapToResponse(config);
  }

  /**
   * Cập nhật cấu hình check-in & định vị quán (chỉ Admin hoặc Quản lý).
   */
  async updateConfig(
    actorRole: string,
    dto: StoreConfigUpdateDto
  ): Promise<StoreConfigResponse> {
    if (actorRole !== 'admin_he_thong' && actorRole !== 'quan_ly') {
      throw new ForbiddenError('Chỉ Admin hệ thống hoặc Quản lý mới có quyền chỉnh sửa cấu hình check-in!');
    }

    let config = await StoreConfigModel.findOne().exec();

    if (!config) {
      config = new StoreConfigModel({
        store_name: dto.store_name || 'Zone Six Cafe & Lounge',
        address: dto.address || '214 Lê Ninh, Phường Quán Bàu, TP Vinh',
        latitude: dto.latitude,
        longitude: dto.longitude,
        geofence_radius_meters: dto.geofence_radius_meters,
        allowed_checkin_before_minutes: dto.allowed_checkin_before_minutes,
        allowed_checkin_after_minutes: dto.allowed_checkin_after_minutes,
        is_geofence_required: dto.is_geofence_required,
        is_time_window_strict: dto.is_time_window_strict,
      });
    } else {
      if (dto.store_name) config.store_name = dto.store_name;
      if (dto.address) config.address = dto.address;
      config.latitude = dto.latitude;
      config.longitude = dto.longitude;
      config.geofence_radius_meters = dto.geofence_radius_meters;
      config.allowed_checkin_before_minutes = dto.allowed_checkin_before_minutes;
      config.allowed_checkin_after_minutes = dto.allowed_checkin_after_minutes;
      config.is_geofence_required = dto.is_geofence_required;
      config.is_time_window_strict = dto.is_time_window_strict;
    }

    await config.save();
    return this.mapToResponse(config);
  }

  /**
   * Kiểm tra tọa độ của người dùng so với tọa độ quán Zone 6.
   */
  async verifyUserLocation(
    userLat: number,
    userLon: number
  ): Promise<{
    is_inside: boolean;
    distance_meters: number;
    allowed_radius: number;
    message: string;
  }> {
    const config = await this.getConfig();
    const distance = calculateDistanceMeters(
      userLat,
      userLon,
      config.latitude,
      config.longitude
    );

    const isInside = distance <= config.geofence_radius_meters;
    const message = isInside
      ? `Bạn đang ở trong phạm vi quán Zone 6 (khoảng cách: ${distance}m / bán kính cho phép: ${config.geofence_radius_meters}m).`
      : `Bạn đang ở ngoài phạm vi quán (khoảng cách: ${distance}m, vượt quá bán kính cho phép ${config.geofence_radius_meters}m).`;

    return {
      is_inside: isInside,
      distance_meters: distance,
      allowed_radius: config.geofence_radius_meters,
      message,
    };
  }

  /**
   * Giải mã tọa độ GPS (lat, lon) thành địa chỉ tiếng Việt chi tiết từ OpenStreetMap
   */
  async reverseGeocode(lat: number, lon: number): Promise<{ address: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Zone6App/1.0 (contact@zonesix.vn)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { address: '' };
      }

      const data = (await res.json()) as any;
      if (data && data.address) {
        const addr = data.address;
        const parts = [
          addr.house_number ? `Số ${addr.house_number}` : null,
          addr.road || addr.street,
          addr.suburb || addr.quarter || addr.neighbourhood,
          addr.ward,
          addr.city_district || addr.district || addr.county,
          addr.city || addr.state || addr.province,
        ].filter(Boolean);

        const uniqueParts = Array.from(new Set(parts));
        if (uniqueParts.length >= 2) {
          return { address: uniqueParts.join(', ') };
        }
      }

      return { address: data?.display_name || '' };
    } catch (err) {
      return { address: '' };
    }
  }

  private mapToResponse(doc: IStoreConfigDoc): StoreConfigResponse {
    return {
      id: doc._id.toString(),
      store_name: doc.store_name,
      address: doc.address,
      latitude: doc.latitude,
      longitude: doc.longitude,
      geofence_radius_meters: doc.geofence_radius_meters ?? 100,
      allowed_checkin_before_minutes: doc.allowed_checkin_before_minutes ?? 30,
      allowed_checkin_after_minutes: doc.allowed_checkin_after_minutes ?? 30,
      is_geofence_required: doc.is_geofence_required ?? true,
      is_time_window_strict: doc.is_time_window_strict ?? true,
      updated_at: doc.updated_at,
    };
  }
}
