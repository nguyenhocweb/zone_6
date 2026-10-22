import React from "react";
import { SchedulingDashboard } from "@/features/scheduling/component/SchedulingDashboard";

export const instant = false;

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <SchedulingDashboard mode="schedule_view" />
    </div>
  );
}
