import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { updateMaterialService } from '../service/material.update.service';
import type { Material, MaterialUpdatePayload } from '../type/material.type';
import { toast } from 'sonner';

interface UpdateArgs {
  id: string;
  payload: MaterialUpdatePayload;
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation<Material, Error, UpdateArgs>({
    mutationFn: ({ id, payload }) => updateMaterialService(id, payload),
    onSuccess: (data) => {
      toast.success(`Đã cập nhật nguyên vật liệu "${data.name}"!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật nguyên vật liệu';
      toast.error(msg);
    },
  });
}
