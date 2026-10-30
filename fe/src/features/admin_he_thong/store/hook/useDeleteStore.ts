import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { deleteStoreService } from '../service/store.delete.service';
import { toast } from 'sonner';

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) => deleteStoreService(id),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.checkinConfig.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa chi nhánh';
      toast.error(msg);
    },
  });
}
