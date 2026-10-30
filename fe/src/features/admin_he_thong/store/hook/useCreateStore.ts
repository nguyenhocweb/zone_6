import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { createStoreService } from '../service/store.create.service';
import type { Store, StoreCreatePayload } from '../type/store.type';
import { toast } from 'sonner';

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation<Store, Error, StoreCreatePayload>({
    mutationFn: (payload) => createStoreService(payload),
    onSuccess: (data) => {
      toast.success(`Đã tạo chi nhánh "${data.store_name}" thành công! 🎉`);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.checkinConfig.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi tạo chi nhánh mới';
      toast.error(msg);
    },
  });
}
