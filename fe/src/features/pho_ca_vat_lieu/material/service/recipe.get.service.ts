import axiosClient from '@/core/api/axios-instance';
import type { Recipe, RecipeListResponse, RecipeListParams } from '../type/recipe.type';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getRecipesService(params?: RecipeListParams): Promise<RecipeListResponse> {
  const res = await axiosClient.get<ApiResponse<RecipeListResponse>>('/api/v1/recipes', {
    params,
  });
  return res.data.data;
}

export async function getRecipeByIdService(id: string): Promise<Recipe> {
  const res = await axiosClient.get<ApiResponse<Recipe>>(`/api/v1/recipes/${id}`);
  return res.data.data;
}
