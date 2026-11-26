import React from "react";
import { ShiftsManagementView } from "@/features/pho_ca_lam_lich/scheduling/component/ShiftsManagementView";

export const instant = false;

export const metadata = {
  title: "Cấu Hình Ca Làm Việc | Go Cà Phê",
  description: "Thiết lập khung giờ làm và định biên số người tối thiểu theo ca",
};

export default function ShiftsPage() {
  return <ShiftsManagementView />;
}
