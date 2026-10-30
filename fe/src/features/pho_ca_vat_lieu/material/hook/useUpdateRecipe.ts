import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { updateRecipeService } from '../service/recipe.update.service';
import type { Recipe, RecipeUpdatePayload } from '../type/recipe.type';
import { toast } from 'sonner';

interface UpdateRecipeArgs {
  id: string;
  payload: RecipeUpdatePayload;
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, UpdateRecipeArgs>({
    mutationFn: ({ id, payload }) => updateRecipeService(id, payload),
    onSuccess: (data) => {
      toast.success(`Đã cập nhật công thức "${data.name}"!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật công thức';
      toast.error(msg);
    },
  });
}
