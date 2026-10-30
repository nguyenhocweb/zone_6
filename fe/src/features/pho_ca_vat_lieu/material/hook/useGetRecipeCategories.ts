import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { getRecipeCategoriesService } from '../service/recipe-category.get.service';
import type { RecipeCategoryListResponse } from '../type/recipe-category.type';

export function useGetRecipeCategories(params?: {
  type?: string;
  is_active?: boolean;
  search?: string;
}) {
  return useQuery<RecipeCategoryListResponse>({
    queryKey: queryKeys.recipes.categories(params),
    queryFn: () => getRecipeCategoriesService(params),
    staleTime: 60 * 1000,
  });
}
