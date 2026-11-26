'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMail, FiShield, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import {
  useDeletePublicReview,
  useRequestReviewActionOtp,
  useUpdatePublicReview,
  useVerifyReviewActionOtp,
} from '../hook/useReviews';
import type { ReviewItem } from '../type/review.type';
import { ReviewEditFormStep } from './ReviewEditFormStep';

interface ReviewActionModalProps {
  review: ReviewItem | null;
  mode: 'EDIT' | 'DELETE' | null;
  onClose: () => void;
}

export const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  review,
  mode,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'EDIT_FORM'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [actionProof, setActionProof] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const requestOtpMutation = useRequestReviewActionOtp();
  const verifyOtpMutation = useVerifyReviewActionOtp();
  const updateMutation = useUpdatePublicReview();
  const deleteMutation = useDeletePublicReview();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (review && mode) {
      setStep('EMAIL');
      setEmail('');
      setOtpCode('');
      setActionProof('');
      setReviewerName(review.reviewer_name === 'Người Ẩn Danh' ? '' : review.reviewer_name);
      setRating(review.rating);
      setSelectedTags(review.tags || []);
      setComment(review.comment);
      setKeptImages(review.images || []);
      setNewFiles([]);
      setNewPreviews([]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [review, mode]);

  if (!review || !mode || !mounted) return null;

  const isDelete = mode === 'DELETE';
  const totalImagesCount = keptImages.length + newFiles.length;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 6 ? [...prev, tag] : prev
    );
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incoming.some((f) => f.size > 5 * 1024 * 1024)) {
      toast.error('Mỗi ảnh dung lượng tối đa 5MB.');
      return;
    }
    const available = Math.max(0, 4 - totalImagesCount);
    const accepted = incoming.slice(0, available);
    if (accepted.length === 0) return;

    setNewFiles((prev) => [...prev, ...accepted]);
    setNewPreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập email đã dùng để đăng đánh giá.');
      return;
    }
    requestOtpMutation.mutate(
      { reviewId: review._id, email: email.trim(), action: isDelete ? 'DELETE' : 'UPDATE' },
      { onSuccess: () => setStep('OTP') }
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpCode.trim())) {
      toast.error('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }

    if (isDelete) {
      deleteMutation.mutate(
        { reviewId: review._id, payload: { email: email.trim(), otp_code: otpCode.trim() } },
        { onSuccess: () => onClose() }
      );
      return;
    }

    verifyOtpMutation.mutate(
      { reviewId: review._id, email: email.trim(), otp_code: otpCode.trim(), action: 'UPDATE' },
      {
        onSuccess: (res) => {
          setActionProof(res.action_proof);
          setStep('EDIT_FORM');
        },
      }
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      toast.error('Nội dung đánh giá tối thiểu 10 ký tự.');
      return;
    }

    updateMutation.mutate(
      {
        reviewId: review._id,
        payload: {
          action_proof: actionProof,
          reviewer_name: reviewerName.trim() || 'Người Ẩn Danh',
          rating,
          tags: selectedTags,
          comment: comment.trim(),
          kept_images: keptImages,
        },
        newFiles,
      },
      {
        onSuccess: () => {
          newPreviews.forEach((u) => URL.revokeObjectURL(u));
          onClose();
        },
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-[#25221e]/50">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">
              {isDelete ? 'Xóa Đánh Giá' : step === 'EDIT_FORM' ? 'Cập Nhật Đánh Giá' : 'Xác Thực Quyền Chỉnh Sửa'}
            </h3>
            <p className="text-[11px] text-stone-500">
              {step === 'EDIT_FORM' ? `Chi nhánh: ${review.store_name}` : `Xác thực đúng email (${review.email_masked})`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {step === 'EMAIL' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nhập lại Email đã đăng đánh giá ({review.email_masked}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="vd: minh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FiMail className="w-4 h-4" />
                <span>{requestOtpMutation.isPending ? 'Đang kiểm tra & gửi OTP...' : 'Gửi Mã OTP Xác Nhận'}</span>
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nhập mã OTP 6 chữ số <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-center font-mono text-xl font-bold tracking-[0.4em] text-stone-900 dark:text-[#efe9de] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={deleteMutation.isPending || verifyOtpMutation.isPending || otpCode.length !== 6}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  isDelete
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311]'
                }`}
              >
                {isDelete ? <FiTrash2 className="w-3.5 h-3.5" /> : <FiShield className="w-3.5 h-3.5" />}
                <span>
                  {isDelete
                    ? deleteMutation.isPending ? 'Đang xóa...' : 'Xác Nhận Xóa Đánh Giá'
                    : verifyOtpMutation.isPending ? 'Đang xác thực...' : 'Xác Nhận Mã OTP'}
                </span>
              </button>
            </form>
          )}

          {step === 'EDIT_FORM' && (
            <ReviewEditFormStep
              reviewerName={reviewerName}
              rating={rating}
              selectedTags={selectedTags}
              comment={comment}
              keptImages={keptImages}
              newPreviews={newPreviews}
              isSaving={updateMutation.isPending}
              onReviewerNameChange={setReviewerName}
              onRatingChange={setRating}
              onToggleTag={toggleTag}
              onCommentChange={setComment}
              onRemoveKeptImage={(idx) => setKeptImages((prev) => prev.filter((_, i) => i !== idx))}
              onRemoveNewImage={(idx) => {
                URL.revokeObjectURL(newPreviews[idx]);
                setNewFiles((prev) => prev.filter((_, i) => i !== idx));
                setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
              }}
              onFilesSelected={handleFilesSelected}
              onSubmit={handleSaveEdit}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
