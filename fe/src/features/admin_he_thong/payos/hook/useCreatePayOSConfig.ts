import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPayOSConfigService } from '../service/payos.create.service';
import { PAYOS_CONFIGS_QUERY_KEY } from './useGetPayOSConfigs';
import { PAYOS_DEFAULT_QUERY_KEY } from './useGetDefaultPayOSConfig';
import type { CreatePayOSPayload } from '../type/payos.type';

export function useCreatePayOSConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayOSPayload) => createPayOSConfigService(payload),
    onSuccess: () => {
      toast.success('Đã thêm tài khoản PayOS thành công');
      queryClient.invalidateQueries({ queryKey: PAYOS_CONFIGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PAYOS_DEFAULT_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi thêm tài khoản PayOS');
    },
  });
}

