import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/constants/query-keys";
import { SubscriptionCreateFormValues } from "../schema/subscription.create.schema";
import { createSubscriptionService } from "../service/subscription.create.service";

export const useCreateSubscription = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscriptionCreateFormValues) => createSubscriptionService(data),
    onSuccess: () => {
      toast.success("Tạo gói dịch vụ thành công!");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Không thể tạo gói dịch vụ!";
      toast.error(message);
    },
  });
};
