import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { createMaterialService } from '../service/material.create.service';
import type { Material, MaterialCreatePayload } from '../type/material.type';
import { toast } from 'sonner';

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation<Material, Error, MaterialCreatePayload>({
    mutationFn: (payload) => createMaterialService(payload),
    onSuccess: (data) => {
      toast.success(`Đã thêm nguyên vật liệu "${data.name}" vào kho!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi thêm nguyên vật liệu';
      toast.error(msg);
    },
  });
}
