import axiosClient from "@/core/api/axios-instance";
import { SubscriptionCreateFormValues } from "../schema/subscription.create.schema";
import { Subscription } from "../type/subscription.type";

export const createSubscriptionService = async (payload: SubscriptionCreateFormValues) => {
  const response = await axiosClient.post<Subscription>("/api/v1/subscriptions", payload);
  return response.data;
};
