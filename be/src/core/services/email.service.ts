import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../logger.js';

export interface SendReviewOtpParams {
  toEmail: string;
  storeName: string;
  otpCode: string;
  expiresInMinutes?: number;
}

export interface SendStaffCredentialsParams {
  toEmail: string;
  staffName: string;
  userCode: string;
  roleLabel: string;
  position: string;
  generatedPassword: string;
  creatorName?: string;
  creatorRoleLabel?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        logger.info(`[EmailService] Đã khởi tạo kết nối SMTP: ${host}:${port}`);
      } catch (err) {
        logger.error('[EmailService] Lỗi kết nối SMTP:', err);
        this.transporter = null;
      }
    } else {
      logger.info('[EmailService] Chưa cấu hình SMTP. Hệ thống sẽ hoạt động ở chế độ ghi log email tự động.');
    }
  }

  /**
   * Gửi email tài khoản và mật khẩu ngẫu nhiên tới nhân viên mới
   * Đảm bảo chỉ người nhận (nhân viên) nhận được mật khẩu qua email cá nhân
   */
  async sendStaffCredentials(params: SendStaffCredentialsParams): Promise<boolean> {
    const {
      toEmail,
      staffName,
      userCode,
      roleLabel,
      position,
      generatedPassword,
      creatorName = 'Ban Quản Trị',
      creatorRoleLabel = 'Quản lý',
    } = params;

    const appUrl = process.env.APP_URL || 'http://localhost:3001';

    // HTML Email Template chuẩn Go Cà Phêxury Obsidian & Gold
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Chào mừng bạn đến với Go Cà Phêunge & Cafe</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #f4f5f8; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #12141a; border: 1px solid #212532; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #f7d77b 0%, #d4af37 50%, #a67c1e 100%); padding: 24px; text-align: center; }
        .header h1 { margin: 0; color: #0b0c10; font-size: 22px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
        .content { padding: 28px 24px; }
        .welcome-text { font-size: 15px; line-height: 1.6; color: #b9becc; margin-bottom: 20px; }
        .credential-box { background-color: #0b0c10; border: 1px solid #d4af37; border-radius: 14px; padding: 18px; margin: 20px 0; }
        .credential-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
        .credential-label { color: #8e95a5; }
        .credential-value { color: #f4f5f8; font-weight: bold; }
        .password-badge { font-family: monospace; font-size: 18px; font-weight: 900; color: #d4af37; background: #1c202c; padding: 6px 12px; border-radius: 8px; border: 1px dashed #d4af37; display: inline-block; letter-spacing: 2px; }
        .warning-text { font-size: 12px; color: #e5a73b; background: rgba(229,167,59,0.1); border-left: 3px solid #e5a73b; padding: 10px 14px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .btn-container { text-align: center; margin: 26px 0 10px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #f7d77b 0%, #d4af37 50%, #a67c1e 100%); color: #0b0c10; font-weight: 900; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; text-transform: uppercase; box-shadow: 0 4px 15px rgba(212,175,55,0.3); }
        .footer { border-top: 1px solid #212532; padding: 18px; text-align: center; font-size: 11px; color: #6d7588; background-color: #0b0c10; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Go Cà Phêunge &amp; Cafe</h1>
          <div style="font-size: 12px; color: #2a230c; font-weight: bold; margin-top: 4px;">Hệ Thống Phân Ca &amp; Xếp Lịch Làm Việc Tự Động</div>
        </div>
        <div class="content">
          <div class="welcome-text">
            Xin chào <strong>${staffName}</strong>,<br>
            Tài khoản nhân sự của bạn trên hệ thống <strong>Go Cà Phêtrong> đã được khởi tạo bởi <strong>${creatorName}</strong> (${creatorRoleLabel}). Dưới đây là thông tin đăng nhập của bạn:
          </div>

          <div class="credential-box">
            <div class="credential-row">
              <span class="credential-label">Mã nhân viên:</span>
              <span class="credential-value" style="color: #d4af37;">${userCode}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">Vai trò:</span>
              <span class="credential-value">${roleLabel}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">Vị trí:</span>
              <span class="credential-value">${position}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">Email đăng nhập:</span>
              <span class="credential-value">${toEmail}</span>
            </div>
            <div style="margin-top: 14px; text-align: center;">
              <div style="font-size: 12px; color: #8e95a5; margin-bottom: 6px;">Mật khẩu ngẫu nhiên của bạn:</div>
              <div class="password-badge">${generatedPassword}</div>
            </div>
          </div>

          <div class="warning-text">
            <strong>Lưu ý bảo mật:</strong> Mật khẩu này được tạo ngẫu nhiên tự động bởi hệ thống và không được tiết lộ cho bất kỳ ai khác (kể cả người tạo tài khoản). Vui lòng đăng nhập và đổi mật khẩu mới tại mục Hồ Sơ Cá Nhân.
          </div>

          <div class="btn-container">
            <a href="${appUrl}" class="btn" target="_blank">Đăng Nhập Ngay</a>
          </div>
        </div>
        <div class="footer">
          Go Cà Phêgnature • Đây là email tự động từ hệ thống quản lý nhân sự Go Cà Phêunge &amp; Cafe.
        </div>
      </div>
    </body>
    </html>
    `;

    // 1. Luôn ghi log chi tiết an toàn vào hệ thống backend
    console.log(`\n================================================================================`);
    console.log(`📧 [Go Cà PhêAIL DISPATCH] GỬI MẬT KHẨU TÀI KHOẢN NHÂN VIÊN MỚI`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Người nhận:  ${staffName} <${toEmail}>`);
    console.log(`Mã NV:       ${userCode}`);
    console.log(`Vai trò:     ${roleLabel} (Vị trí: ${position})`);
    console.log(`Mật khẩu:    ${generatedPassword}`);
    console.log(`Người tạo:   ${creatorName} (${creatorRoleLabel}) - KHÔNG BIẾT MẬT KHẨU NÀY`);
    console.log(`================================================================================\n`);

    // 2. Nếu có transporter SMTP, tiến hành gửi thư thực tế
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Go Cà Phê" <${process.env.SMTP_USER || 'no-reply@zonesix.vn'}>`,
          to: toEmail,
          subject: `[Go Cà Phê] Thông tin tài khoản & Mật khẩu đăng nhập của bạn (${userCode})`,
          html: htmlContent,
        });
        logger.info(`[EmailService] Đã gửi thành công email tới: ${toEmail}`);
        return true;
      } catch (error) {
        logger.error(`[EmailService] Lỗi khi gửi email qua SMTP tới ${toEmail}:`, error);
        return false;
      }
    }

    return true;
  }

  /**
   * Gửi mã OTP xác thực đánh giá chi nhánh cho khách hàng (không cần đăng nhập).
   * Trong production bắt buộc phải có SMTP; trong môi trường dev có thể log ra terminal để test.
   */
  async sendReviewOtp(params: SendReviewOtpParams): Promise<{ sent: boolean; mode: 'smtp' | 'dev_log' }> {
    const { toEmail, storeName, otpCode, expiresInMinutes = 5 } = params;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Mã xác thực đánh giá Go Cà Phê</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f4ee; color: #1f1b16; margin: 0; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e6dfd3; border-radius: 20px; overflow: hidden;">
        <div style="background: #141311; padding: 22px 24px; text-align: center;">
          <div style="font-size: 11px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; font-weight: 700;">Go Cà Phê</div>
          <h1 style="margin: 6px 0 0; color: #efe9de; font-size: 18px; font-weight: 700;">Xác Thực Đánh Giá Chi Nhánh</h1>
        </div>
        <div style="padding: 28px 24px; font-size: 14px; line-height: 1.6; color: #44403c;">
          <p style="margin-top: 0;">Xin chào Quý khách,</p>
          <p>Bạn đang thực hiện gửi đánh giá cho chi nhánh <strong>${storeName}</strong>. Vui lòng nhập mã OTP bên dưới để xác nhận bạn là khách hàng thực tế:</p>
          <div style="margin: 22px 0; text-align: center; background: #f7f4ee; border: 1px dashed #a8791e; border-radius: 14px; padding: 18px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #78716c; margin-bottom: 6px;">Mã xác thực OTP</div>
            <div style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #141311;">${otpCode}</div>
            <div style="font-size: 12px; color: #78716c; margin-top: 8px;">Có hiệu lực trong <strong>${expiresInMinutes} phút</strong></div>
          </div>
          <p style="font-size: 12px; color: #78716c; margin-bottom: 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tuyệt đối không chia sẻ mã OTP cho bất kỳ ai.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: `"Go Cà Phê" <${process.env.SMTP_USER || 'no-reply@zonesix.vn'}>`,
        to: toEmail,
        subject: `[Go Cà Phê] Mã OTP xác thực đánh giá (${otpCode})`,
        html: htmlContent,
      });
      logger.info(`[EmailService] Đã gửi OTP đánh giá tới: ${toEmail}`);
      return { sent: true, mode: 'smtp' };
    }

    if (process.env.NODE_ENV === 'production') {
      logger.error('[EmailService] Thiếu cấu hình SMTP trong môi trường production, không thể gửi OTP.');
      return { sent: false, mode: 'smtp' };
    }

    console.log(`\n📧 [DEV REVIEW OTP] Store: ${storeName} | To: ${toEmail} | OTP: ${otpCode}\n`);
    return { sent: true, mode: 'dev_log' };
  }
}

export const emailService = new EmailService();
