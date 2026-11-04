import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { testPayOSConfigService } from '../service/payos.test.service';
import type { TestPayOSPayload } from '../type/payos.type';

export function useTestPayOSConfig() {
  return useMutation({
    mutationFn: (payload: TestPayOSPayload) => testPayOSConfigService(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Kết nối PayOS thành công rực rỡ!');
      } else {
        toast.error(data.message || 'Kiểm tra PayOS thất bại');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi kiểm tra kết nối PayOS');
    },
  });
}

