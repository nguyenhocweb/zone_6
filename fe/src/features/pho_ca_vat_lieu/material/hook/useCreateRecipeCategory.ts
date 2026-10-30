import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { createRecipeCategoryService } from '../service/recipe-category.create.service';
import type { RecipeCategoryCreatePayload } from '../type/recipe-category.type';
import { toast } from 'sonner';

export function useCreateRecipeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecipeCategoryCreatePayload) => createRecipeCategoryService(payload),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(`Đã thêm danh mục mới: ${newCat.name}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Tạo danh mục thất bại');
    },
  });
}
