import { Metadata } from 'next';
import { LoginForm } from '@/features/shared/auth/component/LoginForm';

export const metadata: Metadata = {
  title: 'Cổng Nhân Sự - Zone Six Đà Nẵng',
  description: 'Hệ thống quản lý ca, điểm danh và vận hành nội bộ Zone Six Đà Nẵng.',
};

// Opt out of experimental Turbopack instant-navigation segment validation
export const instant = false;

export default function LoginPage() {
  return <LoginForm />;
}
