import axiosClient from '@/core/api/axios-instance';
import type { RecipeCategory, RecipeCategoryCreatePayload } from '../type/recipe-category.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function createRecipeCategoryService(
  payload: RecipeCategoryCreatePayload
): Promise<RecipeCategory> {
  const res = await axiosClient.post<ApiResponse<RecipeCategory>>(
    '/api/v1/recipes/categories',
    payload
  );
  return res.data.data;
}
