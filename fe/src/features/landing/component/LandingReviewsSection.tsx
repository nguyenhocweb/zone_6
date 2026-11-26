'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiMapPin, FiMessageSquare, FiStar } from 'react-icons/fi';
import { usePublicReviews } from '@/features/reviews/hook/useReviews';

interface LandingReviewsSectionProps {
  t: Record<string, string>;
}

export const LandingReviewsSection: React.FC<LandingReviewsSectionProps> = ({ t }) => {
  const { data, isLoading } = usePublicReviews({ page: 1, limit: 4 });
  const reviews = data?.reviews || [];
  const summary = data?.summary || {
    averageRating: 0,
    totalReviews: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  return (
    <section
      id="reviews"
      className="py-16 sm:py-24 transition-colors duration-200"
      style={{
        backgroundColor: t.surface,
        borderTop: `1px solid ${t.hairline}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
            Cảm nhận từ khách hàng
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
            Đánh giá thực tế từ những vị khách đã ghé thăm các chi nhánh Go Cà Phê
          </p>
        </div>

        {/* 2-Column Layout: Left = Tổng quan hài lòng, Right = Một vài đánh giá tiêu biểu */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Tổng quan hài lòng & Phân bổ sao */}
          <div
            className="lg:col-span-4 p-6 rounded-2xl space-y-5"
            style={{ backgroundColor: t.bg, border: `1px solid ${t.hairline}` }}
          >
            <div className="space-y-1.5 pb-4" style={{ borderBottom: `1px solid ${t.hairline}` }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: t.textMuted }}>
                Tổng quan hài lòng
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono" style={{ color: t.textPrimary }}>
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm font-mono" style={{ color: t.textMuted }}>
                  / 5.0
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(summary.averageRating)
                        ? 'fill-[#d4af37] text-[#d4af37]'
                        : 'text-stone-400/40'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs pt-1" style={{ color: t.textSecondary }}>
                Dựa trên <strong>{summary.totalReviews}</strong> đánh giá đã xác thực OTP
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.breakdown?.[star] || 0;
                const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-mono font-semibold" style={{ color: t.textPrimary }}>
                      {star} sao
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: t.surfaceRaised }}>
                      <div className="h-full rounded-full bg-[#d4af37]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono" style={{ color: t.textMuted }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/reviews"
              className="w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: t.accent, color: t.accentText }}
            >
              <span>Xem tất cả &amp; Viết đánh giá</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* CỘT PHẢI: Một vài đánh giá mới nhất */}
          <div className="lg:col-span-8 space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-40 rounded-2xl animate-pulse"
                    style={{ backgroundColor: t.bg, border: `1px solid ${t.hairline}` }}
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div
                className="p-10 rounded-2xl text-center space-y-3"
                style={{ backgroundColor: t.bg, border: `1px solid ${t.hairline}` }}
              >
                <p className="text-xs sm:text-sm" style={{ color: t.textSecondary }}>
                  Chưa có đánh giá nào. Hãy chia sẻ trải nghiệm đầu tiên của bạn!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-2xl space-y-3 flex flex-col justify-between"
                    style={{ backgroundColor: t.bg, border: `1px solid ${t.hairline}` }}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>
                            {rev.reviewer_name}
                          </span>
                          <span className="text-[11px] font-mono shrink-0" style={{ color: t.textMuted }}>
                            {rev.email_masked}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating ? 'fill-[#d4af37] text-[#d4af37]' : 'text-stone-400/40'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed line-clamp-3" style={{ color: t.textSecondary }}>
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 text-[11px]" style={{ color: t.textMuted }}>
                      <span className="inline-flex items-center gap-1 truncate">
                        <FiMapPin className="w-3 h-3 shrink-0" style={{ color: t.accent }} />
                        <span className="truncate">{rev.store_name}</span>
                      </span>
                      {rev.owner_reply && (
                        <span className="inline-flex items-center gap-1 font-medium shrink-0" style={{ color: t.accent }}>
                          <FiMessageSquare className="w-3 h-3" />
                          Đã phản hồi
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
