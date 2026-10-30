import axiosClient from "@/core/api/axios-instance";
import type { SellableToppingListResponse, SellableTopping } from "../type/sellable-topping.type";

export const getSellableToppingsService = async (params?: {
  store_id?: string;
  is_active?: boolean;
  search?: string;
}): Promise<SellableToppingListResponse> => {
  const response = await axiosClient.get("/api/v1/sellable-toppings", { params });
  return response.data.data;
};

export const getSellableToppingByIdService = async (id: string): Promise<SellableTopping> => {
  const response = await axiosClient.get(`/api/v1/sellable-toppings/${id}`);
  return response.data.data;
};
