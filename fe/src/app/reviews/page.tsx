import React from 'react';
import { PublicReviewsView } from '@/features/reviews/component/PublicReviewsView';

export const instant = false;

export const metadata = {
  title: 'Đánh Giá Chi Nhánh | Go Cà Phêffee & Lounge',
  description: 'Xem đánh giá thực tế và gửi nhận xét cho các chi nhánh Go Cà Phêông cần đăng nhập',
};

export default function ReviewsPage() {
  return <PublicReviewsView />;
}
