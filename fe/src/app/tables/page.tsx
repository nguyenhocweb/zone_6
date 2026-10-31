import React from 'react';
import { TableManagementView } from '@/features/admin_he_thong/table/component/TableManagementView';

export const metadata = {
  title: 'Sơ Đồ Bàn & QR Code Gọi Món | Zone Six',
  description: 'Quản lý danh sách bàn và xuất mã QR định vị GPS gọi món tại bàn',
};

export default function TablesPage() {
  return <TableManagementView />;
}

