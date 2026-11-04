import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { setDefaultPayOSConfigService } from '../service/payos.set-default.service';
import { PAYOS_CONFIGS_QUERY_KEY } from './useGetPayOSConfigs';
import { PAYOS_DEFAULT_QUERY_KEY } from './useGetDefaultPayOSConfig';

export function useSetDefaultPayOSConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultPayOSConfigService(id),
    onSuccess: (data) => {
      toast.success(`Đã đặt "${data.name}" làm tài khoản thanh toán chính duy nhất!`);
      queryClient.invalidateQueries({ queryKey: PAYOS_CONFIGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PAYOS_DEFAULT_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi đặt tài khoản thanh toán chính');
    },
  });
}

