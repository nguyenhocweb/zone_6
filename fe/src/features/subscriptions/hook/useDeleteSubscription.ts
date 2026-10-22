import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/constants/query-keys";
import { deleteSubscriptionService } from "../service/subscription.delete.service";

export const useDeleteSubscription = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionService(id),
    onSuccess: () => {
      toast.success("Xóa gói dịch vụ thành công!");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Không thể xóa gói dịch vụ!";
      toast.error(message);
    },
  });
};
