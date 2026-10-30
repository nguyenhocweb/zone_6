import axiosClient from '@/core/api/axios-instance';
import type { Recipe, RecipeUpdatePayload } from '../type/recipe.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function updateRecipeService(
  id: string,
  payload: RecipeUpdatePayload
): Promise<Recipe> {
  const res = await axiosClient.put<ApiResponse<Recipe>>(`/api/v1/recipes/${id}`, payload);
  return res.data.data;
}
