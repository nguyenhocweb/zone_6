import { Metadata } from 'next';
import { LoginForm } from '@/features/shared/auth/component/LoginForm';

export const metadata: Metadata = {
  title: 'Cổng Nhân Sự - Go Cà Phê Đà Nẵng',
  description: 'Hệ thống quản lý ca, điểm danh và vận hành nội bộ Go Cà Phê Đà Nẵng.',
};

// Opt out of experimental Turbopack instant-navigation segment validation
export const instant = false;

export default function LoginPage() {
  return <LoginForm />;
}
