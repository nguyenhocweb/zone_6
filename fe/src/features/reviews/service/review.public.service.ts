import axiosClient from '@/core/api/axios-instance';
import type {
  CloudinaryUploadSign,
  PublicStoreItem,
  RequestOtpPayload,
  ReviewItem,
  ReviewListResponse,
  SubmitReviewPayload,
  SubmitReviewResponse,
} from '../type/review.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getPublicReviewStoresService(): Promise<PublicStoreItem[]> {
  const res = await axiosClient.get<ApiResponse<PublicStoreItem[]>>('/api/v1/reviews/public/stores');
  return res.data.data;
}

export async function getPublicReviewsService(params: {
  store_id?: string;
  rating?: number;
  page?: number;
  limit?: number;
}): Promise<ReviewListResponse> {
  const res = await axiosClient.get<ApiResponse<ReviewListResponse>>('/api/v1/reviews/public', {
    params,
  });
  return res.data.data;
}

export async function requestReviewOtpService(payload: RequestOtpPayload): Promise<{
  email_masked: string;
  store_name: string;
  expires_in_seconds: number;
  message?: string;
}> {
  const res = await axiosClient.post<
    ApiResponse<{ email_masked: string; store_name: string; expires_in_seconds: number }>
  >('/api/v1/reviews/public/request-otp', payload);
  return { ...res.data.data, message: res.data.message };
}

export async function submitPublicReviewService(payload: SubmitReviewPayload): Promise<{
  data: SubmitReviewResponse;
  message?: string;
}> {
  const res = await axiosClient.post<ApiResponse<SubmitReviewResponse>>(
    '/api/v1/reviews/public/submit',
    payload
  );
  return { data: res.data.data, message: res.data.message };
}

export async function uploadReviewImageToCloudinaryService(
  file: File,
  sign: CloudinaryUploadSign
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sign.api_key);
  formData.append('timestamp', String(sign.timestamp));
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Không thể tải ảnh lên Cloudinary.');
  }

  const json = await response.json();
  return json.secure_url as string;
}

export async function attachReviewImagesService(
  reviewId: string,
  images: string[],
  upload_proof: string
): Promise<{ _id: string; images: string[] }> {
  const res = await axiosClient.patch<ApiResponse<{ _id: string; images: string[] }>>(
    `/api/v1/reviews/public/${reviewId}/images`,
    { images, upload_proof }
  );
  return res.data.data;
}

export async function requestReviewActionOtpService(
  reviewId: string,
  payload: { email: string; action: 'UPDATE' | 'DELETE' }
): Promise<{ email_masked: string; expires_in_seconds: number; message?: string }> {
  const res = await axiosClient.post<
    ApiResponse<{ email_masked: string; expires_in_seconds: number }>
  >(`/api/v1/reviews/public/${reviewId}/request-action-otp`, payload);
  return { ...res.data.data, message: res.data.message };
}

export async function verifyReviewActionOtpService(
  reviewId: string,
  payload: { email: string; otp_code: string; action: 'UPDATE' | 'DELETE' }
): Promise<{ action_proof: string; message?: string }> {
  const res = await axiosClient.post<ApiResponse<{ action_proof: string }>>(
    `/api/v1/reviews/public/${reviewId}/verify-action-otp`,
    payload
  );
  return { ...res.data.data, message: res.data.message };
}

export async function updatePublicReviewService(
  reviewId: string,
  payload: {
    action_proof: string;
    reviewer_name?: string;
    rating: number;
    tags: string[];
    comment: string;
    kept_images?: string[];
    has_new_images?: boolean;
  }
): Promise<SubmitReviewResponse> {
  const res = await axiosClient.put<ApiResponse<SubmitReviewResponse>>(
    `/api/v1/reviews/public/${reviewId}`,
    payload
  );
  return res.data.data;
}

export async function deletePublicReviewService(
  reviewId: string,
  payload: { email: string; otp_code: string }
): Promise<{ deleted_id: string }> {
  const res = await axiosClient.delete<ApiResponse<{ deleted_id: string }>>(
    `/api/v1/reviews/public/${reviewId}`,
    { data: payload }
  );
  return res.data.data;
}
