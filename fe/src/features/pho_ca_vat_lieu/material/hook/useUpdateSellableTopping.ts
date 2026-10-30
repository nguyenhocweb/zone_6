import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import { updateSellableToppingService } from "../service/sellable-topping.update.service";
import type { SellableToppingUpdatePayload } from "../type/sellable-topping.type";
import { toast } from "sonner";

export const useUpdateSellableTopping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SellableToppingUpdatePayload }) =>
      updateSellableToppingService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellableToppings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      toast.success("Cập nhật thông tin topping bán ra thành công!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Cập nhật topping thất bại";
      toast.error(msg);
    },
  });
};
