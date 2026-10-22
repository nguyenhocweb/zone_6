import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import { getSubscriptionsService } from "../service/subscription.get.service";
import { SubscriptionFilterParams } from "../type/subscription.type";

export const useGetSubscriptions = (params?: SubscriptionFilterParams) => {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(params as Record<string, unknown>),
    queryFn: () => getSubscriptionsService(params),
    staleTime: 60 * 1000,
  });
};
