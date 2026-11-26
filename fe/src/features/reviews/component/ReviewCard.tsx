'use client';

import React, { useState } from 'react';
import { FiEdit2, FiMapPin, FiMoreVertical, FiStar, FiTrash2, FiUser } from 'react-icons/fi';
import type { ReviewItem } from '../type/review.type';
import { ReviewActionModal } from './ReviewActionModal';
import { ReviewImageLightbox } from './ReviewImageLightbox';

interface ReviewCardProps {
  review: ReviewItem;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionMode, setActionMode] = useState<'EDIT' | 'DELETE' | null>(null);

  const isAnonymous = !review.reviewer_name || review.reviewer_name === 'Người Ẩn Danh';
  const initial = review.reviewer_name?.trim().charAt(0).toUpperCase() || 'N';
  const images = review.images || [];
  const extraImagesCount = Math.max(0, images.length - 1);

  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-1 last:pb-1">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-stone-200/80 dark:bg-[#2a2620] border border-stone-300/60 dark:border-stone-700/60 flex items-center justify-center shrink-0 text-xs font-bold text-stone-700 dark:text-[#efe9de] mt-0.5">
        {isAnonymous ? <FiUser className="w-4 h-4 text-stone-500 dark:text-stone-400" /> : initial}
      </div>

      {/* Main Comment Column */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Facebook-style Comment Bubble */}
        <div className="w-full rounded-2xl bg-[#f3f0ea] dark:bg-[#221f1b] border border-stone-200/60 dark:border-stone-800 px-4 py-3 space-y-2.5">
          {/* Header line */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-stone-900 dark:text-[#efe9de]">
                {review.reviewer_name}
              </span>
              <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                {review.email_masked}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-[#181613] border border-stone-200/70 dark:border-stone-700/60">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-2.5 h-2.5 ${
                      star <= review.rating
                        ? 'fill-[#d4af37] text-[#d4af37]'
                        : 'text-stone-300 dark:text-stone-600'
                    }`}
                  />
                ))}
                <span className="ml-1 text-[10px] font-bold font-mono text-stone-700 dark:text-[#efe9de]">
                  {review.rating}.0
                </span>
              </span>
            </div>

            {/* 3-dot Menu (Sửa / Xóa bằng xác nhận Email OTP) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="w-7 h-7 rounded-full hover:bg-stone-200/70 dark:hover:bg-stone-700/60 text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
                title="Tùy chọn đánh giá"
              >
                <FiMoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-20 w-40 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-700 shadow-lg py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActionMode('EDIT');
                    }}
                    className="w-full px-3.5 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#25221e] flex items-center gap-2 cursor-pointer"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActionMode('DELETE');
                    }}
                    className="w-full px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Xóa đánh giá</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body: Ảnh bên trái (nếu có) + Nội dung & Tags bên phải */}
          <div className={images.length > 0 ? 'flex items-start gap-3.5' : 'space-y-1.5'}>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200/80 dark:border-stone-700/60 shrink-0 bg-white dark:bg-[#181613] shadow-xs group cursor-pointer"
                title={extraImagesCount > 0 ? `Xem tất cả ${images.length} ảnh` : 'Xem ảnh'}
              >
                <img
                  src={images[0]}
                  alt="Ảnh đánh giá"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {extraImagesCount > 0 && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-white text-base font-bold font-mono tracking-tight">
                      +{extraImagesCount}
                    </span>
                  </div>
                )}
              </button>
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[13px] leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-line break-words">
                {review.comment}
              </p>

              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/80 dark:bg-[#181613] text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta line below bubble */}
        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 pl-2">
          <span className="inline-flex items-center gap-1 font-medium">
            <FiMapPin className="w-3 h-3 text-stone-400" />
            {review.store_name}
          </span>
          <span>•</span>
          <span>{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
        </div>

        {/* Threaded Owner Reply */}
        {review.owner_reply && (
          <div className="mt-1.5 pl-3 ml-1 border-l-2 border-stone-200 dark:border-stone-700/80 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
              GP
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="w-full rounded-2xl bg-[#f3f0ea] dark:bg-[#221f1b] border border-stone-200/60 dark:border-stone-800 px-3.5 py-2.5 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">
                    {review.replied_by_name || 'Quản Lý Go Cà Phê'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-[#d4af37]">
                    Quản trị viên
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line break-words">
                  {review.owner_reply}
                </p>
              </div>
              {review.replied_at && (
                <div className="text-[10px] text-stone-400 pl-2">
                  {new Date(review.replied_at).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ReviewImageLightbox
        images={images}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      <ReviewActionModal
        review={review}
        mode={actionMode}
        onClose={() => setActionMode(null)}
      />
    </div>
  );
};
