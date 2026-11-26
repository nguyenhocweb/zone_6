import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  attachReviewImagesService,
  deletePublicReviewService,
  getPublicReviewStoresService,
  getPublicReviewsService,
  requestReviewActionOtpService,
  requestReviewOtpService,
  submitPublicReviewService,
  updatePublicReviewService,
  uploadReviewImageToCloudinaryService,
  verifyReviewActionOtpService,
} from '../service/review.public.service';
import {
  getManageReviewsService,
  replyReviewService,
  toggleReviewStatusService,
} from '../service/review.manage.service';
import type { RequestOtpPayload, SubmitReviewPayload } from '../type/review.type';

export const REVIEW_KEYS = {
  publicStores: ['reviews', 'public', 'stores'] as const,
  publicList: (params: Record<string, any>) => ['reviews', 'public', 'list', params] as const,
  manageList: (params: Record<string, any>) => ['reviews', 'manage', 'list', params] as const,
};

export function usePublicReviewStores() {
  return useQuery({
    queryKey: REVIEW_KEYS.publicStores,
    queryFn: getPublicReviewStoresService,
    staleTime: 60_000,
  });
}

export function usePublicReviews(params: {
  store_id?: string;
  rating?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: REVIEW_KEYS.publicList(params),
    queryFn: () => getPublicReviewsService(params),
    staleTime: 30_000,
  });
}

export function useRequestReviewOtp() {
  return useMutation({
    mutationFn: (payload: RequestOtpPayload) => requestReviewOtpService(payload),
    onSuccess: (res) => {
      toast.success(res.message || `Đã gửi mã OTP tới ${res.email_masked}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    },
  });
}

export function useSubmitPublicReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
      files = [],
    }: {
      payload: SubmitReviewPayload;
      files?: File[];
    }) => {
      // 1. Tạo đánh giá trên Backend & nhận chữ ký Cloudinary (folder: zone_6/reviews/{store}/{reviewId})
      const res = await submitPublicReviewService({
        ...payload,
        has_images: files.length > 0,
      });

      const { review, cloudinary_upload } = res.data;

      // 2. Nếu có ảnh, Frontend đẩy trực tiếp lên Cloudinary rồi gắn URL vào đánh giá vừa tạo
      if (files.length > 0 && cloudinary_upload) {
        const uploadedUrls = await Promise.all(
          files.map((file) => uploadReviewImageToCloudinaryService(file, cloudinary_upload))
        );
        await attachReviewImagesService(
          review._id,
          uploadedUrls,
          cloudinary_upload.upload_proof
        );
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Cảm ơn Quý khách đã gửi đánh giá!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Xác thực OTP hoặc gửi đánh giá thất bại.'
      );
    },
  });
}

export function useManageReviews(params: {
  store_id?: string;
  rating?: number;
  status?: 'PUBLISHED' | 'HIDDEN' | '';
  replied?: 'true' | 'false' | '';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: REVIEW_KEYS.manageList(params),
    queryFn: () => getManageReviewsService(params),
    staleTime: 30_000,
  });
}

export function useReplyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, owner_reply }: { id: string; owner_reply: string }) =>
      replyReviewService(id, owner_reply),
    onSuccess: () => {
      toast.success('Đã gửi phản hồi công khai tới khách hàng!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể gửi phản hồi.');
    },
  });
}

export function useToggleReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      hidden_reason,
    }: {
      id: string;
      status: 'PUBLISHED' | 'HIDDEN';
      hidden_reason?: string;
    }) => toggleReviewStatusService(id, status, hidden_reason),
    onSuccess: (res) => {
      toast.success(
        res.status === 'HIDDEN' ? 'Đã ẩn đánh giá khỏi trang công khai.' : 'Đã hiển thị lại đánh giá.'
      );
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái đánh giá.');
    },
  });
}

export function useRequestReviewActionOtp() {
  return useMutation({
    mutationFn: ({
      reviewId,
      email,
      action,
    }: {
      reviewId: string;
      email: string;
      action: 'UPDATE' | 'DELETE';
    }) => requestReviewActionOtpService(reviewId, { email, action }),
    onSuccess: (res) => {
      toast.success(res.message || `Đã gửi mã OTP xác nhận tới ${res.email_masked}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Email không khớp hoặc không thể gửi OTP.');
    },
  });
}

export function useVerifyReviewActionOtp() {
  return useMutation({
    mutationFn: ({
      reviewId,
      email,
      otp_code,
      action,
    }: {
      reviewId: string;
      email: string;
      otp_code: string;
      action: 'UPDATE' | 'DELETE';
    }) => verifyReviewActionOtpService(reviewId, { email, otp_code, action }),
    onSuccess: () => {
      toast.success('Xác thực OTP thành công! Bạn có thể chỉnh sửa đánh giá.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    },
  });
}

export function useUpdatePublicReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      payload,
      newFiles = [],
    }: {
      reviewId: string;
      payload: {
        action_proof: string;
        reviewer_name?: string;
        rating: number;
        tags: string[];
        comment: string;
        kept_images: string[];
      };
      newFiles?: File[];
    }) => {
      const res = await updatePublicReviewService(reviewId, {
        ...payload,
        has_new_images: newFiles.length > 0,
      });

      if (newFiles.length > 0 && res.cloudinary_upload) {
        const newUrls = await Promise.all(
          newFiles.map((file) => uploadReviewImageToCloudinaryService(file, res.cloudinary_upload!))
        );
        await attachReviewImagesService(
          reviewId,
          [...payload.kept_images, ...newUrls],
          res.cloudinary_upload.upload_proof
        );
      }

      return res;
    },
    onSuccess: () => {
      toast.success('Đã cập nhật đánh giá thành công!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật đánh giá.');
    },
  });
}

export function useDeletePublicReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: { email: string; otp_code: string };
    }) => deletePublicReviewService(reviewId, payload),
    onSuccess: () => {
      toast.success('Đã xóa đánh giá thành công!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể xóa đánh giá.');
    },
  });
}
