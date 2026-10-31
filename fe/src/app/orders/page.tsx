import React from 'react';
import { OrderManagementView } from '@/features/pos/component/OrderManagementView';

export const metadata = {
  title: 'Quản Lý Hóa Đơn & Bill | Zone Six',
  description: 'Danh sách hóa đơn POS và gọi món tại bàn, in lại hóa đơn K80',
};

export default function OrdersPage() {
  return <OrderManagementView />;
}

