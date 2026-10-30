import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { getRecipeByIdService } from '../service/recipe.get.service';
import type { Recipe } from '../type/recipe.type';

export function useGetRecipeDetail(id: string | null) {
  return useQuery<Recipe>({
    queryKey: queryKeys.recipes.detail(id || ''),
    queryFn: () => getRecipeByIdService(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
