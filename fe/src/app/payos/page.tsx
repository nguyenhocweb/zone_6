import React from 'react';
import { PayOSManagementView } from '@/features/admin_he_thong/payos/component/PayOSManagementView';

export const metadata = {
  title: 'Cấu Hình PayOS | Zone Six Coffee & Lounge',
  description: 'Quản trị tài khoản thanh toán PayOS Open Banking và VietQR',
};

export default function PayOSPage() {
  return <PayOSManagementView />;
}

