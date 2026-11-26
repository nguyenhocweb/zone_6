'use client';

import React from 'react';
import { FiCheck, FiImage, FiStar, FiX } from 'react-icons/fi';

const QUICK_TAGS = [
  'Không gian yên tĩnh',
  'Đồ uống ngon',
  'Phục vụ nhiệt tình',
  'Wifi ổn định',
  'Giá hợp lý',
  'Nhạc nhẹ nhàng',
];

interface ReviewEditFormStepProps {
  reviewerName: string;
  rating: number;
  selectedTags: string[];
  comment: string;
  keptImages: string[];
  newPreviews: string[];
  isSaving: boolean;
  onReviewerNameChange: (v: string) => void;
  onRatingChange: (v: number) => void;
  onToggleTag: (tag: string) => void;
  onCommentChange: (v: string) => void;
  onRemoveKeptImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onFilesSelected: (files: FileList | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ReviewEditFormStep: React.FC<ReviewEditFormStepProps> = ({
  reviewerName,
  rating,
  selectedTags,
  comment,
  keptImages,
  newPreviews,
  isSaving,
  onReviewerNameChange,
  onRatingChange,
  onToggleTag,
  onCommentChange,
  onRemoveKeptImage,
  onRemoveNewImage,
  onFilesSelected,
  onSubmit,
}) => {
  const totalImagesCount = keptImages.length + newPreviews.length;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Tên hiển thị <span className="font-normal text-stone-400">(tùy chọn)</span>
        </label>
        <input
          type="text"
          placeholder="Để trống sẽ hiện Người Ẩn Danh"
          value={reviewerName}
          onChange={(e) => onReviewerNameChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Mức độ hài lòng ({rating}/5 sao)
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-[#25221e] cursor-pointer"
            >
              <FiStar
                className={`w-7 h-7 ${
                  star <= rating ? 'fill-[#d4af37] text-[#d4af37]' : 'text-stone-300 dark:text-stone-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Điểm ấn tượng (chọn tối đa 6)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs border cursor-pointer ${
                  active
                    ? 'bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] border-stone-900 dark:border-[#d4af37] font-semibold'
                    : 'bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Nhận xét chi tiết <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          required
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
          Hình ảnh trải nghiệm <span className="font-normal text-stone-400">(tối đa 4 ảnh)</span>
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {keptImages.map((url, idx) => (
            <div key={url} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
              <img src={url} alt={`Ảnh cũ ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveKeptImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
          {newPreviews.map((url, idx) => (
            <div key={url} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
              <img src={url} alt={`Ảnh mới ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveNewImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
          {totalImagesCount < 4 && (
            <label className="w-16 h-16 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#25221e] hover:border-stone-500 flex flex-col items-center justify-center gap-1 text-[10px] text-stone-500 cursor-pointer">
              <FiImage className="w-4 h-4" />
              <span>Thêm ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  onFilesSelected(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <FiCheck className="w-4 h-4" />
        <span>{isSaving ? 'Đang lưu thay đổi...' : 'Lưu Thay Đổi'}</span>
      </button>
    </form>
  );
};
