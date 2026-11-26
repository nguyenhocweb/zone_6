'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiChevronDown, FiEdit3, FiMoon, FiStar, FiSun } from 'react-icons/fi';
import { useTheme } from '@/core/providers/ThemeProvider';
import { usePublicReviews, usePublicReviewStores } from '../hook/useReviews';
import type { ReviewItem } from '../type/review.type';
import { ReviewCard } from './ReviewCard';
import { ReviewSubmitModal } from './ReviewSubmitModal';

const PAGE_SIZE = 10;

export const PublicReviewsView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [accumulatedReviews, setAccumulatedReviews] = useState<ReviewItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stores = [] } = usePublicReviewStores();
  const { data, isLoading, isFetching } = usePublicReviews({
    store_id: selectedStoreId || undefined,
    rating: selectedRating,
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (!data?.reviews) return;
    if (page === 1) {
      setAccumulatedReviews(data.reviews);
    } else {
      setAccumulatedReviews((prev) => {
        const seen = new Set(prev.map((item) => item._id));
        const nextItems = data.reviews.filter((item) => !seen.has(item._id));
        return [...prev, ...nextItems];
      });
    }
  }, [data, page]);

  const handleFilterChange = (nextStoreId: string, nextRating: number | undefined) => {
    setSelectedStoreId(nextStoreId);
    setSelectedRating(nextRating);
    setPage(1);
    setAccumulatedReviews([]);
  };

  const summary = data?.summary || {
    averageRating: 0,
    totalReviews: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
  const pagination = data?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };
  const remainingCount = Math.max(0, pagination.total - accumulatedReviews.length);
  const hasMore = page < pagination.totalPages && remainingCount > 0;

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-[#141311] text-[#1f1b16] dark:text-[#efe9de] transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-[#141311]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#25221e] text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-sm font-bold tracking-tight">Đánh Giá Chi Nhánh Go Cà Phê</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              title="Đổi giao diện Sáng / Tối"
            >
              {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={stores.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>Viết Đánh Giá</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Branch Selector Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('', selectedRating)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
              selectedStoreId === ''
                ? 'bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] border-stone-900 dark:border-[#d4af37]'
                : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'
            }`}
          >
            Tất cả chi nhánh
          </button>
          {stores.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => handleFilterChange(s._id, selectedRating)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                selectedStoreId === s._id
                  ? 'bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] border-stone-900 dark:border-[#d4af37]'
                  : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'
              }`}
            >
              {s.store_name}
            </button>
          ))}
        </div>

        {/* 2-Column Split Layout: Left = Tổng số sao, Right = Danh sách đánh giá */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Tổng số sao & Phân bổ */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
            <div className="space-y-1.5 border-b border-stone-200/70 dark:border-stone-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Tổng quan hài lòng
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-stone-900 dark:text-[#efe9de]">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-stone-400 font-mono">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(summary.averageRating)
                        ? 'fill-[#d4af37] text-[#d4af37]'
                        : 'text-stone-300 dark:text-stone-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 pt-1">
                Dựa trên <strong>{summary.totalReviews}</strong> đánh giá đã xác thực OTP
              </p>
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.breakdown[star] || 0;
                const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                const active = selectedRating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFilterChange(selectedStoreId, active ? undefined : star)}
                    className={`w-full flex items-center gap-3 text-xs py-1.5 px-2.5 rounded-xl transition cursor-pointer ${
                      active
                        ? 'bg-stone-100 dark:bg-[#25221e] ring-1 ring-stone-300 dark:ring-stone-700'
                        : 'hover:bg-stone-50 dark:hover:bg-[#25221e]/50'
                    }`}
                  >
                    <span className="w-10 text-left font-mono font-semibold">{star} sao</span>
                    <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-[#25221e] overflow-hidden">
                      <div
                        className="h-full bg-[#d4af37] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-stone-500">{count}</span>
                  </button>
                );
              })}
            </div>

            {selectedRating !== undefined && (
              <button
                type="button"
                onClick={() => handleFilterChange(selectedStoreId, undefined)}
                className="w-full py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#25221e] cursor-pointer"
              >
                Bỏ lọc {selectedRating} sao
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={stores.length === 0}
              className="w-full py-3 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>Viết Đánh Giá Của Bạn</span>
            </button>
          </aside>

          {/* CỘT PHẢI: Danh sách đánh giá (mỗi lần 10 đánh giá + nút Xem thêm) */}
          <section className="lg:col-span-8 space-y-4">
            {isLoading && page === 1 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 text-center text-xs text-stone-400">
                Đang tải đánh giá...
              </div>
            ) : accumulatedReviews.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  Chưa có đánh giá nào phù hợp bộ lọc. Hãy là người đầu tiên chia sẻ trải nghiệm!
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={stores.length === 0}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-xs font-semibold cursor-pointer"
                >
                  Gửi Đánh Giá Ngay
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-xs divide-y divide-stone-200/60 dark:divide-stone-800/70">
                {accumulatedReviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}

            {/* Nút Xem Thêm 10 đánh giá */}
            {hasMore && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-6 py-2.5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 text-xs font-semibold text-stone-800 dark:text-[#efe9de] shadow-xs inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <FiChevronDown className="w-4 h-4" />
                  <span>
                    {isFetching
                      ? 'Đang tải thêm...'
                      : `Xem thêm ${Math.min(PAGE_SIZE, remainingCount)} đánh giá (còn ${remainingCount})`}
                  </span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <ReviewSubmitModal
        isOpen={isModalOpen}
        stores={stores}
        defaultStoreId={selectedStoreId || undefined}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
