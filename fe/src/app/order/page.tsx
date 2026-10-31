'use client';

import React, { Suspense } from 'react';
import { TableOrderView } from '@/features/table-order/component/TableOrderView';

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-[#d4af37]">
          Đang tải giao diện bàn...
        </div>
      }
    >
      <TableOrderView />
    </Suspense>
  );
}

