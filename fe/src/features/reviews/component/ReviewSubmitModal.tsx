'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import { RequestOtpFormSchema, VerifyOtpSchema } from '../schema/review.schema';
import { useRequestReviewOtp, useSubmitPublicReview } from '../hook/useReviews';
import type { PublicStoreItem } from '../type/review.type';
import { ReviewFormStep } from './ReviewFormStep';
import { ReviewOtpVerifyStep } from './ReviewOtpVerifyStep';

interface ReviewSubmitModalProps {
  isOpen: boolean;
  stores: PublicStoreItem[];
  defaultStoreId?: string;
  onClose: () => void;
}

export const ReviewSubmitModal: React.FC<ReviewSubmitModalProps> = ({
  isOpen,
  stores,
  defaultStoreId,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [storeId, setStoreId] = useState(defaultStoreId || '');
  const [email, setEmail] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const requestOtpMutation = useRequestReviewOtp();
  const submitReviewMutation = useSubmitPublicReview();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStoreId(defaultStoreId || stores[0]?._id || '');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultStoreId, stores]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen || !mounted) return null;

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
    const availableSlots = Math.max(0, 4 - selectedFiles.length);
    const accepted = incoming.slice(0, availableSlots);
    if (accepted.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...accepted]);
    setPreviewUrls((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAndClose = () => {
    setStep('FORM');
    setOtpCode('');
    setResendCooldown(0);
    onClose();
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = RequestOtpFormSchema.safeParse({
      store_id: storeId,
      email,
      reviewer_name: reviewerName,
      rating,
      tags: selectedTags,
      comment,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Vui lòng kiểm tra lại thông tin.');
      return;
    }

    requestOtpMutation.mutate(
      { store_id: storeId, email: email.trim(), website_hp: honeypot },
      {
        onSuccess: () => {
          setStep('OTP');
          setResendCooldown(60);
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    requestOtpMutation.mutate(
      { store_id: storeId, email: email.trim(), website_hp: honeypot },
      { onSuccess: () => setResendCooldown(60) }
    );
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCheck = VerifyOtpSchema.safeParse({ otp_code: otpCode });
    if (!otpCheck.success) {
      toast.error(otpCheck.error.issues[0]?.message || 'Mã OTP phải gồm 6 chữ số.');
      return;
    }

    submitReviewMutation.mutate(
      {
        payload: {
          store_id: storeId,
          email: email.trim(),
          otp_code: otpCode.trim(),
          reviewer_name: reviewerName.trim() || 'Người Ẩn Danh',
          rating,
          tags: selectedTags,
          comment: comment.trim(),
        },
        files: selectedFiles,
      },
      {
        onSuccess: () => {
          previewUrls.forEach((url) => URL.revokeObjectURL(url));
          setEmail('');
          setReviewerName('');
          setComment('');
          setSelectedFiles([]);
          setPreviewUrls([]);
          setSelectedTags([]);
          setRating(5);
          resetAndClose();
        },
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-[#25221e]/50">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
              {step === 'FORM' ? 'Đánh Giá Chi Nhánh Go Cà Phê' : 'Xác Thực OTP Qua Email'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Không cần đăng nhập • Mỗi email đánh giá 1 lần / chi nhánh
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {step === 'FORM' ? (
            <ReviewFormStep
              stores={stores}
              storeId={storeId}
              email={email}
              reviewerName={reviewerName}
              rating={rating}
              selectedTags={selectedTags}
              comment={comment}
              previewUrls={previewUrls}
              honeypot={honeypot}
              isRequestingOtp={requestOtpMutation.isPending}
              onStoreChange={setStoreId}
              onEmailChange={setEmail}
              onReviewerNameChange={setReviewerName}
              onRatingChange={setRating}
              onToggleTag={toggleTag}
              onCommentChange={setComment}
              onFilesSelected={handleFilesSelected}
              onRemoveImage={handleRemoveImage}
              onHoneypotChange={setHoneypot}
              onSubmit={handleRequestOtp}
            />
          ) : (
            <ReviewOtpVerifyStep
              otpCode={otpCode}
              resendCooldown={resendCooldown}
              isResending={requestOtpMutation.isPending}
              isSubmitting={submitReviewMutation.isPending}
              onOtpChange={setOtpCode}
              onBackToForm={() => setStep('FORM')}
              onResendOtp={handleResendOtp}
              onSubmit={handleSubmitFinal}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
