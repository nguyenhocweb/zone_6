import axiosClient from "@/core/api/axios-instance";
import type { SellableTopping, SellableToppingUpdatePayload } from "../type/sellable-topping.type";

export const updateSellableToppingService = async (
  id: string,
  payload: SellableToppingUpdatePayload
): Promise<SellableTopping> => {
  const response = await axiosClient.put(`/api/v1/sellable-toppings/${id}`, payload);
  return response.data.data;
};
