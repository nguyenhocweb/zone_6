import crypto from 'crypto';
import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { OrderRepository } from '../../../pos/repositories/order.repository.js';
import { emitPosEvent } from '../../../pos/socket/pos.socket.js';
import { logger } from '../../../../core/logger.js';
import { BadRequestError } from '../../../../core/errors.js';

function sortObjDataByKey(object: any) {
  if (!object || typeof object !== 'object') return {};
  const sortedData: Record<string, any> = {};
  Object.keys(object)
    .sort()
    .forEach((key) => {
      sortedData[key] = object[key];
    });
  return sortedData;
}

export function verifyPayOSWebhookSignature(webhookBody: any, checksumKey: string): boolean {
  if (!webhookBody || !webhookBody.data || !webhookBody.signature) return false;
  const rawData = webhookBody.data;
  const receivedSignature = webhookBody.signature;

  const sortedData = sortObjDataByKey(rawData);
  const dataString = Object.keys(sortedData)
    .map((key) => {
      let value = sortedData[key];
      if (value === null || value === undefined) {
        value = '';
      }
      return `${key}=${value}`;
    })
    .join('&');

  const calculatedSignature = crypto
    .createHmac('sha256', checksumKey)
    .update(dataString)
    .digest('hex');

  return calculatedSignature === receivedSignature;
}

export class PayOSWebhookService {
  private payosRepo: PayOSConfigRepository;
  private orderRepo: OrderRepository;

  constructor() {
    this.payosRepo = new PayOSConfigRepository();
    this.orderRepo = new OrderRepository();
  }

  async handleWebhook(webhookBody: any) {
    logger.info('[PayOS Webhook] Nhận request webhook: ' + JSON.stringify(webhookBody));

    const config = await this.payosRepo.findDefault();
    if (!config) {
      logger.error('[PayOS Webhook] Không tìm thấy cấu hình PayOS hoạt động trong database');
      return { success: false, message: 'No active PayOS configuration found' };
    }

    // 1. Xác thực chữ ký
    const checksumKey = (config as any).checksum_key || '';
    const isValidSignature = verifyPayOSWebhookSignature(webhookBody, checksumKey);
    if (!isValidSignature) {
      logger.warn('[PayOS Webhook] Chữ ký HMAC-SHA256 không hợp lệ hoặc dữ liệu bị sửa đổi!');
      // Trả về false nhưng ghi nhận để bảo mật
      return { success: false, message: 'Invalid signature' };
    }

    const { orderCode, amount, description, code, reference } = webhookBody.data || {};

    if (code !== '00') {
      logger.info(`[PayOS Webhook] Giao dịch không thành công (code=${code})`);
      return { success: true, message: 'Payment not successful' };
    }

    // 2. Tìm đơn hàng tương ứng (theo orderCode hoặc description)
    let matchedOrder = null;

    if (description) {
      matchedOrder = await this.orderRepo.findPendingByDescription(description);
    }

    if (!matchedOrder && orderCode) {
      matchedOrder = await this.orderRepo.findByOrderCode(String(orderCode));
    }

    if (!matchedOrder) {
      logger.warn(
        `[PayOS Webhook] Không tìm thấy đơn hàng tương ứng cho description="${description}" / orderCode="${orderCode}"`
      );
      return { success: true, message: 'No matching pending order found' };
    }

    // 3. Cập nhật trạng thái đơn hàng sang COMPLETED
    const updatedOrder = await this.orderRepo.updatePaymentStatus(
      matchedOrder._id.toString(),
      'COMPLETED',
      {
        paid_at: new Date(),
        paid_by_name: 'Cổng PayOS MBBank VietQR (Webhook)',
        payment_method: 'VIETQR',
        payos_reference: reference,
        payos_amount_received: amount,
      }
    );

    // 4. Bắn sự kiện WebSocket tới POS và màn hình gọi món thời gian thực
    const storeIdStr = matchedOrder.store_id.toString();
    
    emitPosEvent(storeIdStr, 'pos:payment_success', {
      orderId: matchedOrder._id.toString(),
      orderCode: matchedOrder.order_code,
      amount: matchedOrder.final_amount,
      receivedAmount: amount,
      tableNumber: matchedOrder.table_number,
      customerName: matchedOrder.customer_name,
      order: updatedOrder,
    });

    emitPosEvent(storeIdStr, 'pos:order_completed', {
      order: updatedOrder,
      completedBy: { name: 'Cổng PayOS MBBank' },
    });

    logger.info(`[PayOS Webhook] 🎉 Đơn hàng ${matchedOrder.order_code} đã thanh toán tự động thành công qua PayOS!`);

    return {
      success: true,
      message: 'Payment verified and order updated successfully',
      orderCode: matchedOrder.order_code,
      amount,
    };
  }

  /**
   * Endpoint hỗ trợ mô phỏng / kiểm tra thanh toán nhanh cho môi trường test/local
   */
  async simulatePayment(orderCode: string, customAmount?: number) {
    const order = await this.orderRepo.findByOrderCode(orderCode);
    if (!order) {
      throw new BadRequestError(`Không tìm thấy đơn hàng với mã ${orderCode}`);
    }

    const updatedOrder = await this.orderRepo.updatePaymentStatus(
      order._id.toString(),
      'COMPLETED',
      {
        paid_at: new Date(),
        paid_by_name: 'Cổng PayOS MBBank (Simulated)',
        payment_method: 'VIETQR',
        payos_amount_received: customAmount || order.final_amount,
      }
    );

    const storeIdStr = order.store_id.toString();
    emitPosEvent(storeIdStr, 'pos:payment_success', {
      orderId: order._id.toString(),
      orderCode: order.order_code,
      amount: order.final_amount,
      receivedAmount: customAmount || order.final_amount,
      tableNumber: order.table_number,
      customerName: order.customer_name,
      order: updatedOrder,
    });

    emitPosEvent(storeIdStr, 'pos:order_completed', {
      order: updatedOrder,
      completedBy: { name: 'Cổng PayOS MBBank (Simulated)' },
    });

    return updatedOrder;
  }
}
