'use client';

import React from 'react';
import { FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import { usePublicReviewStores } from '@/features/reviews/hook/useReviews';

interface LandingStoresSectionProps {
  t: Record<string, string>;
}

const FALLBACK_STORE_IMAGE =
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=85';

export const LandingStoresSection: React.FC<LandingStoresSectionProps> = ({ t }) => {
  const { data: stores = [], isLoading } = usePublicReviewStores();

  return (
    <section id="stores" className="py-16 sm:py-24 max-w-7xl mx-auto px-6 space-y-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
          Hệ thống chi nhánh Go Cà Phê
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
          Không gian rộng rãi, thoáng đãng đang mở cửa đón bạn.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl animate-pulse"
              style={{ backgroundColor: t.surface, border: `1px solid ${t.hairline}` }}
            />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div
          className="p-10 rounded-2xl text-center text-xs"
          style={{ backgroundColor: t.surface, border: `1px solid ${t.hairline}`, color: t.textSecondary }}
        >
          Chưa có chi nhánh đang hoạt động.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store._id}
              className="rounded-2xl overflow-hidden group transition-all duration-300"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={store.image_url || FALLBACK_STORE_IMAGE}
                  alt={store.store_name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/60 text-emerald-400 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Đang mở cửa
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
                  {store.store_name}
                </h3>
                <div className="space-y-1.5 text-xs" style={{ color: t.textSecondary }}>
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: t.accent }} />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                    <span>{store.operating_hours || '07:00 – 23:00 mỗi ngày'}</span>
                  </div>
                  {store.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                      <span>{store.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
