import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { toggleStoreStatusService } from '../service/store.status.service';
import type { Store, StoreStatusPayload } from '../type/store.type';
import { toast } from 'sonner';

interface ToggleStatusArgs {
  id: string;
  payload: StoreStatusPayload;
}

export function useToggleStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation<{ store: Store; message: string }, Error, ToggleStatusArgs>({
    mutationFn: ({ id, payload }) => toggleStoreStatusService(id, payload),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.checkinConfig.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật trạng thái chi nhánh';
      toast.error(msg);
    },
  });
}
