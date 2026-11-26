import React from "react";
import { Metadata } from "next";
import { RecipesView } from "@/features/pho_ca_vat_lieu/material/component/RecipesView";

export const instant = false;

export const metadata: Metadata = {
  title: "Quản Lý Món & Sổ Tay Công Thức | Go Cà Phê",
  description:
    "Quản lý danh sách món bán khách hàng và các công thức sơ chế nội bộ bảo mật của hệ thống Go Cà Phê",
};

export default function RecipesPage() {
  return <RecipesView />;
}
