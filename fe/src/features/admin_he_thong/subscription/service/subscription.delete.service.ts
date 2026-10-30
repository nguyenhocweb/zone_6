import axiosClient from "@/core/api/axios-instance";

export const deleteSubscriptionService = async (id: string) => {
  await axiosClient.delete(`/api/v1/subscriptions/${id}`);
};
