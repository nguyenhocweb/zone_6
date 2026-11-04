import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { TestPayOSConfigDTO } from '../schemas/payos-config.schema.js';
import { BadRequestError, NotFoundError } from '../../../../core/errors.js';

export class PayOSConfigTestService {
  constructor(private repo = new PayOSConfigRepository()) {}

  async execute(dto: TestPayOSConfigDTO) {
    let clientId = dto.client_id;
    let apiKey = dto.api_key;
    let checksumKey = dto.checksum_key;

    // Nếu truyền id, lấy credentials từ database
    if (dto.id) {
      const config = await this.repo.findById(dto.id);
      if (!config) {
        throw new NotFoundError('Không tìm thấy tài khoản PayOS để kiểm tra');
      }
      clientId = config.client_id;
      apiKey = config.api_key;
      checksumKey = config.checksum_key;
    }

    if (!clientId || !apiKey || !checksumKey) {
      throw new BadRequestError('Cần cung cấp đầy đủ Client ID, API Key và Checksum Key để kiểm tra');
    }

    try {
      // Gọi kiểm tra tính hợp lệ của Client ID & API Key thông qua API của PayOS
      const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests/0', {
        method: 'GET',
        headers: {
          'x-client-id': clientId.trim(),
          'x-api-key': apiKey.trim(),
        },
      });

      // Nếu 401: Sai Client ID hoặc API Key
      if (response.status === 401) {
        return {
          success: false,
          status: 'UNAUTHORIZED',
          message: 'Client ID hoặc API Key không hợp lệ hoặc đã bị khóa trên PayOS!',
        };
      }

      const data = (await response.json().catch(() => null)) as any;

      if (data && data.code === '20') {
        return {
          success: false,
          status: 'UNAUTHORIZED',
          message: data.desc || 'Thông tin xác thực PayOS không chính xác',
        };
      }

      // Khi mã trả về không phải 401 (ví dụ 404 hoặc code 21 "Không tìm thấy đơn hàng"),
      // chứng tỏ Client ID và API Key đã được PayOS xác thực thành công!
      return {
        success: true,
        status: 'CONNECTED',
        message: 'Kết nối và xác thực tài khoản PayOS thành công rực rỡ!',
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'NETWORK_ERROR',
        message: `Lỗi kết nối tới máy chủ PayOS: ${error.message || 'Không thể gửi yêu cầu'}`,
      };
    }
  }
}
