'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/core/api/axios-instance';

interface PublicRecipeItem {
  id: string;
  name: string;
  type?: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
}

interface LandingMenuSectionProps {
  t: Record<string, string>;
}

const FALLBACK_DRINK_IMAGE =
  'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=700&q=85';

export const LandingMenuSection: React.FC<LandingMenuSectionProps> = ({ t }) => {
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['landing', 'public-recipes'],
    queryFn: async () => {
      const res = await axiosClient.get<{ data: { recipes: PublicRecipeItem[] } }>(
        '/api/v1/recipes',
        { params: { is_active: true, type: 'customer_product' } }
      );
      const list = (res.data?.data?.recipes || []).filter(
        (item) => (!item.type || item.type === 'customer_product') && Number(item.price) > 0
      );
      const uniqueByName = new Map<string, PublicRecipeItem>();
      for (const item of list) {
        if (!uniqueByName.has(item.name)) {
          uniqueByName.set(item.name, item);
        }
      }
      return Array.from(uniqueByName.values()).slice(0, 4);
    },
    staleTime: 60_000,
  });

  return (
    <section id="menu" className="py-16 sm:py-24 max-w-7xl mx-auto px-6 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
            Thức uống đặc trưng
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
            Pha chế từ hạt rang mộc và trái cây tươi trong ngày.
          </p>
        </div>
        <p className="text-xs" style={{ color: t.textMuted }}>
          * Quét mã QR tại bàn để xem trọn bộ thực đơn
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl animate-pulse"
              style={{ backgroundColor: t.surface, border: `1px solid ${t.hairline}` }}
            />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div
          className="p-10 rounded-2xl text-center text-xs"
          style={{ backgroundColor: t.surface, border: `1px solid ${t.hairline}`, color: t.textSecondary }}
        >
          Thực đơn đang được cập nhật từ hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={item.image_url || FALLBACK_DRINK_IMAGE}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>
                    {item.name}
                  </h3>
                  <span className="text-xs font-mono font-semibold shrink-0" style={{ color: t.accent }}>
                    {Number(item.price || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <p className="text-xs line-clamp-2" style={{ color: t.textSecondary }}>
                  {item.description || 'Hương vị nguyên bản được pha chế tỉ mỉ tại Go Cà Phê.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
