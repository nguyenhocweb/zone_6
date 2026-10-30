import React from "react";
import { Metadata } from "next";
import { MaterialsView } from "@/features/pho_ca_vat_lieu/material/component/MaterialsView";

export const instant = false;

export const metadata: Metadata = {
  title: "Kho Vật Liệu & Sổ Tay Công Thức | Zone 6",
  description:
    "Quản lý nguyên vật liệu, ly nhựa, bao bì và sổ tay công thức pha chế nội bộ bảo mật của hệ thống Zone 6",
};

export default function MaterialsPage() {
  return <MaterialsView />;
}
