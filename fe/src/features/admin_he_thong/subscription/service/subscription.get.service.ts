import axiosClient from "@/core/api/axios-instance";
import { PaginatedSubscriptionsResponse, Subscription, SubscriptionFilterParams } from "../type/subscription.type";

export const getSubscriptionsService = async (params?: SubscriptionFilterParams) => {
  const response = await axiosClient.get<PaginatedSubscriptionsResponse>("/api/v1/subscriptions", {
    params,
  });
  return response.data;
};

export const getSubscriptionByIdService = async (id: string) => {
  const response = await axiosClient.get<Subscription>(`/api/v1/subscriptions/${id}`);
  return response.data;
};
