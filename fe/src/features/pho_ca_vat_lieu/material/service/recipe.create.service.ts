import axiosClient from '@/core/api/axios-instance';
import type { Recipe, RecipeCreatePayload } from '../type/recipe.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function createRecipeService(payload: RecipeCreatePayload): Promise<Recipe> {
  const res = await axiosClient.post<ApiResponse<Recipe>>('/api/v1/recipes', payload);
  return res.data.data;
}
