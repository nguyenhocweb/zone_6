import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import { getSellableToppingsService } from "../service/sellable-topping.get.service";

export const useGetSellableToppings = (params?: { store_id?: string; is_active?: boolean; search?: string }) => {
  return useQuery({
    queryKey: queryKeys.sellableToppings.list(params),
    queryFn: () => getSellableToppingsService(params),
    staleTime: 60 * 1000,
  });
};
