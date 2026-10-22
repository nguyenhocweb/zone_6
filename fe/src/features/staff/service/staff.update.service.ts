import axiosClient from "@/core/api/axios-instance";
import type { StaffItem, UpdateStaffPayload, UpdateStaffResponse } from "../type/staff.type";

export async function updateStaffService(
  staffId: string,
  payload: UpdateStaffPayload
): Promise<{ staff: StaffItem; message: string }> {
  const response = await axiosClient.put<UpdateStaffResponse>(
    `/api/v1/users/staff/${staffId}`,
    payload
  );
  return {
    staff: response.data.data,
    message: response.data.message,
  };
}
