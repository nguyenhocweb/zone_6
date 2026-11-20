import { Metadata } from 'next';
import { LandingView } from '@/features/landing/component/LandingView';

export const metadata: Metadata = {
  title: 'Zone Six - Cà Phê Mộc & Không Gian Tĩnh Đà Nẵng',
  description:
    'Không gian cà phê mộc và tĩnh lặng tại Đà Nẵng. Thưởng thức hương vị nguyên bản và trải nghiệm gọi món tại bàn tiện lợi.',
};

export default function HomePage() {
  return <LandingView />;
}
