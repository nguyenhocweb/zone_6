import React from "react";
import { Metadata } from "next";
import { InventoryAuditView } from "@/features/pho_ca_vat_lieu/material/component/InventoryAuditView";

export const instant = false;

export const metadata: Metadata = {
  title: "Kiểm Kê Kho & Đối Soát Tồn Kho | Go Cà Phê",
  description:
    "Phân hệ kiểm kê kho thực tế, đối soát chênh lệch, tra cứu tài khoản kiểm kho theo từng ngày và cập nhật tồn kho hệ thống Go Cà Phê",
};

export default function InventoryAuditPage() {
  return <InventoryAuditView />;
}
