import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deletePayOSConfigService } from '../service/payos.delete.service';
import { PAYOS_CONFIGS_QUERY_KEY } from './useGetPayOSConfigs';
import { PAYOS_DEFAULT_QUERY_KEY } from './useGetDefaultPayOSConfig';

export function useDeletePayOSConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayOSConfigService(id),
    onSuccess: () => {
      toast.success('Đã xóa tài khoản PayOS thành công');
      queryClient.invalidateQueries({ queryKey: PAYOS_CONFIGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PAYOS_DEFAULT_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa tài khoản PayOS');
    },
  });
}
