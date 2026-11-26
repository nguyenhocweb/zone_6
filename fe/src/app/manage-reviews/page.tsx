import React from 'react';
import { ManageReviewsView } from '@/features/reviews/component/ManageReviewsView';

export const instant = false;

export const metadata = {
  title: 'Phản Hồi Đánh Giá Khách Hàng | Go Cà Phê',
  description: 'Quản lý và phản hồi đánh giá chi nhánh dành riêng cho Quản Lý và Admin Hệ Thống',
};

export default function ManageReviewsPage() {
  return <ManageReviewsView />;
}
