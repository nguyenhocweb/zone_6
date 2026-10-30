import React from "react";
import { Metadata } from "next";
import { RecipesView } from "@/features/pho_ca_vat_lieu/material/component/RecipesView";

export const instant = false;

export const metadata: Metadata = {
  title: "Quản Lý Món & Sổ Tay Công Thức | Zone 6",
  description:
    "Quản lý danh sách món bán khách hàng và các công thức sơ chế nội bộ bảo mật của hệ thống Zone 6",
};

export default function RecipesPage() {
  return <RecipesView />;
}
