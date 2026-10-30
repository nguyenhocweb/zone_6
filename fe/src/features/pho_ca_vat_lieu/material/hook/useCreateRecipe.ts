import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { createRecipeService } from '../service/recipe.create.service';
import type { Recipe, RecipeCreatePayload } from '../type/recipe.type';
import { toast } from 'sonner';

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, RecipeCreatePayload>({
    mutationFn: (payload) => createRecipeService(payload),
    onSuccess: (data) => {
      toast.success(`Đã thêm công thức "${data.name}" thành công!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi tạo công thức';
      toast.error(msg);
    },
  });
}
