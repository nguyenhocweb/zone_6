'use client';

import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMessageSquare, FiStar } from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';
import {
  useManageReviews,
  usePublicReviewStores,
  useToggleReviewStatus,
} from '../hook/useReviews';
import type { ReviewItem } from '../type/review.type';
import { ReviewReplyModal } from './ReviewReplyModal';

export const ManageReviewsView: React.FC = () => {
  const { user } = useAuth();
  const canManageReviews = user?.role === 'admin_he_thong' || user?.role === 'quan_ly';

  const [storeId, setStoreId] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [repliedFilter, setRepliedFilter] = useState<'true' | 'false' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'PUBLISHED' | 'HIDDEN' | ''>('');
  const [page, setPage] = useState(1);

  const [replyTarget, setReplyTarget] = useState<ReviewItem | null>(null);
  const [hideTarget, setHideTarget] = useState<ReviewItem | null>(null);

  const { data: stores = [] } = usePublicReviewStores();
  const { data, isLoading } = useManageReviews({
    store_id: storeId || undefined, rating: rating ? Number(rating) : undefined,
    replied: repliedFilter, status: statusFilter, page, limit: 15,
  });

  const toggleStatusMutation = useToggleReviewStatus();

  if (!canManageReviews) {
    return (
      <div className="p-10 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-center space-y-3">
        <FiLock className="w-8 h-8 text-stone-400 mx-auto" />
        <h2 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
          Không có quyền truy cập
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Chức năng Phản Hồi Đánh Giá chỉ dành riêng cho Quản Lý và Admin Hệ Thống.
        </p>
      </div>
    );
  }

  const assignedSet = new Set((user?.assigned_stores || []).map(String));
  const visibleStores =
    user?.role === 'admin_he_thong'
      ? stores
      : stores.filter((s) => assignedSet.has(String(s._id)));

  const reviews = data?.reviews || [];
  const summary = data?.summary || { averageRating: 0, totalReviews: 0, breakdown: {} };
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Banner & KPIs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0">
            <FiMessageSquare className="w-5 h-5 text-stone-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-[#efe9de]">
              Phản Hồi Đánh Giá Khách Hàng
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Dành riêng cho Quản Lý &amp; Admin Hệ Thống • Theo dõi điểm hài lòng và phản hồi công khai
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/70 dark:border-stone-800 text-right">
            <div className="text-[11px] text-stone-500">Điểm trung bình</div>
            <div className="text-lg font-mono font-black text-amber-600 dark:text-[#d4af37]">
              {summary.averageRating.toFixed(1)} / 5.0
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/70 dark:border-stone-800 text-right">
            <div className="text-[11px] text-stone-500">Tổng đánh giá</div>
            <div className="text-lg font-mono font-black text-stone-900 dark:text-[#efe9de]">
              {summary.totalReviews}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <select
          value={storeId}
          onChange={(e) => { setStoreId(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-[#efe9de]"
        >
          <option value="">Tất cả chi nhánh phụ trách</option>
          {visibleStores.map((s) => (<option key={s._id} value={s._id}>{s.store_name}</option>))}
        </select>

        <select
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-[#efe9de]"
        >
          <option value="">Tất cả số sao</option>
          {[5, 4, 3, 2, 1].map((s) => (<option key={s} value={s}>{s} sao</option>))}
        </select>

        <select
          value={repliedFilter}
          onChange={(e) => { setRepliedFilter(e.target.value as 'true' | 'false' | ''); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-[#efe9de]"
        >
          <option value="">Tất cả trạng thái phản hồi</option>
          <option value="false">Chưa phản hồi</option>
          <option value="true">Đã phản hồi</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as 'PUBLISHED' | 'HIDDEN' | ''); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-[#efe9de]"
        >
          <option value="">Tất cả hiển thị</option>
          <option value="PUBLISHED">Đang hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>
      </div>

      {/* Review List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-stone-400">Đang tải danh sách đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
            Chưa có đánh giá nào phù hợp bộ lọc.
          </div>
        ) : (
          reviews.map((rev) => {
            const isHidden = rev.status === 'HIDDEN';
            return (
              <div
                key={rev._id}
                className={`p-5 rounded-3xl bg-white dark:bg-[#1c1a17] border shadow-xs space-y-3 ${
                  isHidden
                    ? 'border-rose-200 dark:border-rose-900/50 opacity-75'
                    : 'border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">
                        {rev.reviewer_name}
                      </span>
                      <span className="text-xs font-mono text-stone-400">{rev.email_masked}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                        {rev.store_name}
                      </span>
                      {isHidden && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-[#d4af37]">
                        <FiStar className="w-3.5 h-3.5 fill-[#d4af37]" /> {rev.rating}.0
                      </span>
                      <span>•</span>
                      <span>{new Date(rev.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyTarget(rev)}
                      className="px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiMessageSquare className="w-3.5 h-3.5" />
                      <span>{rev.owner_reply ? 'Sửa Phản Hồi' : 'Phản Hồi'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHideTarget(rev)}
                      className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {isHidden ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                      <span>{isHidden ? 'Hiện Lại' : 'Ẩn'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">{rev.comment}</p>

                {rev.images && rev.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rev.images.map((imgUrl, idx) => (
                      <a
                        key={imgUrl}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 block"
                      >
                        <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {rev.owner_reply && (
                  <div className="p-3.5 rounded-2xl bg-[#f7f4ee] dark:bg-[#25221e] border border-stone-200/70 dark:border-stone-700/60 text-xs space-y-1">
                    <div className="font-semibold text-amber-700 dark:text-[#d4af37]">
                      Phản hồi bởi {rev.replied_by_name}
                    </div>
                    <p className="text-stone-700 dark:text-stone-300">{rev.owner_reply}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs disabled:opacity-40 cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-xs font-mono text-stone-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs disabled:opacity-40 cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}

      <ReviewReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} />

      <ConfirmModal
        isOpen={Boolean(hideTarget)}
        title={hideTarget?.status === 'HIDDEN' ? 'Hiển Thị Lại Đánh Giá' : 'Ẩn Đánh Giá Vi Phạm'}
        message={
          hideTarget?.status === 'HIDDEN'
            ? `Khôi phục hiển thị đánh giá của "${hideTarget?.reviewer_name}" lên trang công khai?`
            : `Ẩn đánh giá của "${hideTarget?.reviewer_name}" khỏi trang công khai? (Email vẫn được lưu để chống đánh giá lại)`
        }
        confirmLabel={hideTarget?.status === 'HIDDEN' ? 'Hiển Thị Lại' : 'Xác Nhận Ẩn'}
        cancelLabel="Bỏ Qua"
        isDestructive={hideTarget?.status !== 'HIDDEN'}
        isLoading={toggleStatusMutation.isPending}
        onCancel={() => setHideTarget(null)}
        onConfirm={() => {
          if (!hideTarget) return;
          const nextStatus = hideTarget.status === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN';
          toggleStatusMutation.mutate(
            { id: hideTarget._id, status: nextStatus },
            { onSuccess: () => setHideTarget(null) }
          );
        }}
      />
    </div>
  );
};
