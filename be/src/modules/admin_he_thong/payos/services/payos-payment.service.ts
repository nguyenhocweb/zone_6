import crypto from 'crypto';
import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { logger } from '../../../../core/logger.js';

export interface ICreatePaymentLinkInput {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl?: string;
  returnUrl?: string;
  expiredAt?: number;
}

export interface IPayOSPaymentLinkResult {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  accountName: string;
  bin: string;
  paymentLinkId: string;
  checkoutUrl: string;
  qrCode: string;
}

export class PayOSPaymentService {
  private payosRepo: PayOSConfigRepository;

  constructor() {
    this.payosRepo = new PayOSConfigRepository();
  }

  /**
   * Đăng ký Payment Request chính thức trên máy chủ PayOS
   * PayOS sẽ chủ động theo dõi tài khoản MBBank và bắn Webhook khi khách thanh toán
   */
  async createPaymentLink(input: ICreatePaymentLinkInput): Promise<IPayOSPaymentLinkResult | null> {
    const config = await this.payosRepo.findDefault();
    if (!config || !config.is_active) {
      logger.warn('[PayOS Payment] Không tìm thấy cấu hình PayOS hoạt động.');
      return null;
    }

    const clientId = (config as any).client_id?.trim();
    const apiKey = (config as any).api_key?.trim();
    const checksumKey = (config as any).checksum_key?.trim();

    if (!clientId || !apiKey || !checksumKey) {
      logger.warn('[PayOS Payment] Thiếu Client ID, API Key hoặc Checksum Key của PayOS.');
      return null;
    }

    const cancelUrl = input.cancelUrl || 'http://localhost:3001/pos';
    const returnUrl = input.returnUrl || 'http://localhost:3001/pos';
    // PayOS giới hạn description tối đa 25 ký tự, không dấu và không chứa ký tự đặc biệt
    const cleanDesc = input.description
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .slice(0, 25);

    // Chuỗi ký signature theo thứ tự alphabet: amount, cancelUrl, description, orderCode, returnUrl
    const rawDataString = `amount=${input.amount}&cancelUrl=${cancelUrl}&description=${cleanDesc}&orderCode=${input.orderCode}&returnUrl=${returnUrl}`;
    const signature = crypto
      .createHmac('sha256', checksumKey)
      .update(rawDataString)
      .digest('hex');

    const payload: any = {
      orderCode: input.orderCode,
      amount: input.amount,
      description: cleanDesc,
      cancelUrl,
      returnUrl,
      signature,
    };

    if (input.expiredAt) {
      payload.expiredAt = input.expiredAt;
    }

    try {
      logger.info(`[PayOS Payment] Đang khởi tạo Payment Request cho orderCode=${input.orderCode}, amount=${input.amount}`);
      const res = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
        method: 'POST',
        headers: {
          'x-client-id': clientId,
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as any;

      if (json && json.code === '00' && json.data) {
        logger.info(`[PayOS Payment] Tạo Payment Request thành công! Link ID: ${json.data.paymentLinkId}`);
        return {
          orderCode: json.data.orderCode,
          amount: json.data.amount,
          description: json.data.description,
          accountNumber: json.data.accountNumber,
          accountName: json.data.accountName,
          bin: json.data.bin,
          paymentLinkId: json.data.paymentLinkId,
          checkoutUrl: json.data.checkoutUrl,
          qrCode: json.data.qrCode,
        };
      } else {
        logger.error(`[PayOS Payment] Lỗi từ PayOS API: ${json?.desc || JSON.stringify(json)}`);
        return null;
      }
    } catch (err: any) {
      logger.error(`[PayOS Payment] Ngoại lệ khi gọi PayOS API: ${err.message}`);
      return null;
    }
  }
}
