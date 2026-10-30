import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import { updateMaterialStockService } from '../service/material.update.service';
import type { Material, MaterialStockUpdatePayload } from '../type/material.type';
import { toast } from 'sonner';

interface StockUpdateArgs {
  id: string;
  payload: MaterialStockUpdatePayload;
}

export function useUpdateMaterialStock() {
  const queryClient = useQueryClient();

  return useMutation<Material, Error, StockUpdateArgs>({
    mutationFn: ({ id, payload }) => updateMaterialStockService(id, payload),
    onSuccess: (data) => {
      toast.success(`Đã cập nhật tồn kho "${data.name}": ${data.quantity_in_stock} ${data.unit}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật tồn kho';
      toast.error(msg);
    },
  });
}
