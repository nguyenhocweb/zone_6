'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import { OwnerReplySchema } from '../schema/review.schema';
import { useReplyReview } from '../hook/useReviews';
import type { ReviewItem } from '../type/review.type';

interface ReviewReplyModalProps {
  review: ReviewItem | null;
  onClose: () => void;
}

export const ReviewReplyModal: React.FC<ReviewReplyModalProps> = ({ review, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyMutation = useReplyReview();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (review) {
      setReplyText(review.owner_reply || '');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [review]);

  if (!review || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = OwnerReplySchema.safeParse({ owner_reply: replyText });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Nội dung phản hồi không hợp lệ.');
      return;
    }

    replyMutation.mutate(
      { id: review._id, owner_reply: parsed.data.owner_reply },
      { onSuccess: () => onClose() }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#25221e]/40">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#efe9de]">
            <FiMessageSquare className="w-4 h-4 text-stone-400" />
            <h3 className="text-sm font-bold">Phản Hồi Đánh Giá Khách Hàng</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>
                <strong className="text-stone-900 dark:text-[#efe9de]">{review.reviewer_name}</strong> ({review.email_masked})
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-[#d4af37]">
                {review.rating}/5 ★
              </span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 italic">"{review.comment}"</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Nội dung phản hồi công khai <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Cảm ơn Quý khách đã ghé thăm Go Cà Phê"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-xs font-semibold text-stone-600 dark:text-stone-300 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={replyMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>{replyMutation.isPending ? 'Đang gửi...' : 'Gửi Phản Hồi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
