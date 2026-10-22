import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/constants/query-keys";
import { SubscriptionUpdateFormValues } from "../schema/subscription.update.schema";
import { updateSubscriptionService } from "../service/subscription.update.service";

export const useUpdateSubscription = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionUpdateFormValues }) =>
      updateSubscriptionService(id, data),
    onSuccess: () => {
      toast.success("Cập nhật gói dịch vụ thành công!");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Không thể cập nhật gói!";
      toast.error(message);
    },
  });
};
