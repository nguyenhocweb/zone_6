import { z } from 'zod';

export const demoValidator = {
  chuoi: (tenTruong = 'Trường này') =>
    z.string({ required_error: `${tenTruong} không được để trống` })
      .trim()
      .min(1, `${tenTruong} không được để trống`),

  soDuong: (tenTruong = 'Số') =>
    z.number({ required_error: `${tenTruong} không được để trống` })
      .positive(`${tenTruong} phải lớn hơn 0`),

  soDienThoai: () =>
    z.string()
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không đúng định dạng Việt Nam'),

  email: () =>
    z.string().email('Địa chỉ Email không đúng định dạng'),

  maQR: () =>
    z.string().min(3, 'Mã QR không hợp lệ'),

  toaDo: () =>
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().optional().default(0),
    }),
};
