import axiosClient from "@/core/api/axios-instance";
import { SubscriptionUpdateFormValues } from "../schema/subscription.update.schema";
import { Subscription } from "../type/subscription.type";

export const updateSubscriptionService = async (id: string, payload: SubscriptionUpdateFormValues) => {
  const response = await axiosClient.put<Subscription>(`/api/v1/subscriptions/${id}`, payload);
  return response.data;
};
