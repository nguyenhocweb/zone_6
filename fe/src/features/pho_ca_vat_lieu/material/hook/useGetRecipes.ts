import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { getRecipesService } from '../service/recipe.get.service';
import type { RecipeListResponse, RecipeListParams } from '../type/recipe.type';

export function useGetRecipes(params?: RecipeListParams) {
  return useQuery<RecipeListResponse>({
    queryKey: queryKeys.recipes.list(params),
    queryFn: () => getRecipesService(params),
    staleTime: 60 * 1000,
  });
}
