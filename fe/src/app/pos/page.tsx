import { Metadata } from 'next';
import { PosView } from '@/features/pos/component/PosView';

export const metadata: Metadata = {
  title: 'Bán Hàng POS - Go Cà Phê Đà Nẵng',
  description: 'Hệ thống bán hàng và thu ngân trực tiếp Live POS Go Cà Phê Đà Nẵng.',
};

// Opt out of experimental Turbopack instant-navigation segment validation
export const instant = false;

export default function PosPage() {
  return <PosView />;
}
