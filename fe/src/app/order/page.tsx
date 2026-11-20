import { Metadata } from 'next';
import React, { Suspense } from 'react';
import { TableOrderView } from '@/features/table-order/component/TableOrderView';

export const metadata: Metadata = {
  title: 'Gọi Món Tại Bàn - Zone Six Đà Nẵng',
  description: 'Thực đơn điện tử và đặt món trực tuyến tại bàn Zone Six Đà Nẵng.',
};

// Opt out of experimental Turbopack instant-navigation segment validation
export const instant = false;

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 dark:bg-[#141311] flex items-center justify-center text-stone-600 dark:text-stone-300">
          Đang tải giao diện bàn...
        </div>
      }
    >
      <TableOrderView />
    </Suspense>
  );
}
