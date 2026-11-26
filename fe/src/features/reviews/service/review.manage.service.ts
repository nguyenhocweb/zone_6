import axiosClient from '@/core/api/axios-instance';
import type { ReviewItem, ReviewListResponse } from '../type/review.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getManageReviewsService(params: {
  store_id?: string;
  rating?: number;
  status?: 'PUBLISHED' | 'HIDDEN' | '';
  replied?: 'true' | 'false' | '';
  page?: number;
  limit?: number;
}): Promise<ReviewListResponse> {
  const cleanParams: Record<string, any> = {
    page: params.page || 1,
    limit: params.limit || 15,
  };
  if (params.store_id) cleanParams.store_id = params.store_id;
  if (params.rating) cleanParams.rating = params.rating;
  if (params.status) cleanParams.status = params.status;
  if (params.replied) cleanParams.replied = params.replied;

  const res = await axiosClient.get<ApiResponse<ReviewListResponse>>('/api/v1/reviews/manage', {
    params: cleanParams,
  });
  return res.data.data;
}

export async function replyReviewService(id: string, owner_reply: string): Promise<ReviewItem> {
  const res = await axiosClient.patch<ApiResponse<ReviewItem>>(`/api/v1/reviews/${id}/reply`, {
    owner_reply,
  });
  return res.data.data;
}

export async function toggleReviewStatusService(
  id: string,
  status: 'PUBLISHED' | 'HIDDEN',
  hidden_reason?: string
): Promise<ReviewItem> {
  const res = await axiosClient.patch<ApiResponse<ReviewItem>>(`/api/v1/reviews/${id}/status`, {
    status,
    hidden_reason,
  });
  return res.data.data;
}
