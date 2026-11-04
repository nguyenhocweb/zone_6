import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePayOSConfigService } from '../service/payos.update.service';
import { PAYOS_CONFIGS_QUERY_KEY } from './useGetPayOSConfigs';
import { PAYOS_DEFAULT_QUERY_KEY } from './useGetDefaultPayOSConfig';
import type { UpdatePayOSPayload } from '../type/payos.type';

export function useUpdatePayOSConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayOSPayload }) =>
      updatePayOSConfigService(id, payload),
    onSuccess: () => {
      toast.success('Cập nhật tài khoản PayOS thành công');
      queryClient.invalidateQueries({ queryKey: PAYOS_CONFIGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PAYOS_DEFAULT_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật tài khoản PayOS');
    },
  });
}

