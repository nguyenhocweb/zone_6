import React from "react";
import { ShiftRegistrationView } from "@/features/scheduling/component/ShiftRegistrationView";

export const instant = false;

export default function ScheduleRegisterPage() {
  return (
    <div className="space-y-6">
      <ShiftRegistrationView />
    </div>
  );
}
