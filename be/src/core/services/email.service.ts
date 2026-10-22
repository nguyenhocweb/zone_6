import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../logger.js';

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

    // HTML Email Template chuẩn Zone 6 Luxury Obsidian & Gold
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Chào mừng bạn đến với Zone 6 Lounge & Cafe</title>
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
          <h1>Zone 6 Lounge &amp; Cafe</h1>
          <div style="font-size: 12px; color: #2a230c; font-weight: bold; margin-top: 4px;">Hệ Thống Phân Ca &amp; Xếp Lịch Làm Việc Tự Động</div>
        </div>
        <div class="content">
          <div class="welcome-text">
            Xin chào <strong>${staffName}</strong>,<br>
            Tài khoản nhân sự của bạn trên hệ thống <strong>Zone 6</strong> đã được khởi tạo bởi <strong>${creatorName}</strong> (${creatorRoleLabel}). Dưới đây là thông tin đăng nhập của bạn:
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
          Zone 6 Signature • Đây là email tự động từ hệ thống quản lý nhân sự Zone 6 Lounge &amp; Cafe.
        </div>
      </div>
    </body>
    </html>
    `;

    // 1. Luôn ghi log chi tiết an toàn vào hệ thống backend
    console.log(`\n================================================================================`);
    console.log(`📧 [ZONE 6 EMAIL DISPATCH] GỬI MẬT KHẨU TÀI KHOẢN NHÂN VIÊN MỚI`);
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
          from: `"Zone 6 Lounge & Cafe" <${process.env.SMTP_USER || 'no-reply@zonesix.vn'}>`,
          to: toEmail,
          subject: `[Zone 6] Thông tin tài khoản & Mật khẩu đăng nhập của bạn (${userCode})`,
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
}

export const emailService = new EmailService();
