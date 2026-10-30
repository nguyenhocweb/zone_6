import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { updateStoreService } from '../service/store.update.service';
import type { Store, StoreUpdatePayload } from '../type/store.type';
import { toast } from 'sonner';

interface UpdateStoreArgs {
  id: string;
  payload: StoreUpdatePayload;
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation<Store, Error, UpdateStoreArgs>({
    mutationFn: ({ id, payload }) => updateStoreService(id, payload),
    onSuccess: (data) => {
      toast.success(`Cập nhật chi nhánh "${data.store_name}" thành công! ✨`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.checkinConfig.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật chi nhánh';
      toast.error(msg);
    },
  });
}
