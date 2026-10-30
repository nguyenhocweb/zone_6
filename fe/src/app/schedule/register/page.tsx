import React from "react";
import { ShiftRegistrationView } from "@/features/nhan_vien/shift-registration/component/ShiftRegistrationView";

export const instant = false;

export default function ScheduleRegisterPage() {
  return (
    <div className="space-y-6">
      <ShiftRegistrationView />
    </div>
  );
}
