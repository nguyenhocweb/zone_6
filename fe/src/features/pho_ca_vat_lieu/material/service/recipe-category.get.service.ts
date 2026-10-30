import axiosClient from '@/core/api/axios-instance';
import type { RecipeCategoryListResponse } from '../type/recipe-category.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getRecipeCategoriesService(params?: {
  type?: string;
  is_active?: boolean;
  search?: string;
}): Promise<RecipeCategoryListResponse> {
  const res = await axiosClient.get<ApiResponse<RecipeCategoryListResponse>>(
    '/api/v1/recipes/categories',
    { params }
  );
  return res.data.data;
}
