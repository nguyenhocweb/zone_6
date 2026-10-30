import axiosClient from "@/core/api/axios-instance";
import type { CreateStaffPayload, CreateStaffResponse, StaffItem } from "../type/staff.type";

export async function createStaffService(
  payload: CreateStaffPayload
): Promise<{ staff: StaffItem; message: string }> {
  const response = await axiosClient.post<CreateStaffResponse>(
    "/api/v1/users/staff",
    payload
  );
  return {
    staff: response.data.data,
    message: response.data.message,
  };
}
