"use client";

import React, { useState, useMemo } from "react";
import {
  FiTruck,
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiInbox,
} from "react-icons/fi";
import { useGetSuppliers, useDeleteSupplier } from "../hook/useSuppliers";
import { CreateSupplierModal } from "./CreateSupplierModal";
import { EditSupplierModal } from "./EditSupplierModal";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";
import type { Supplier } from "../type/supplier.type";
import type { Material } from "@/features/pho_ca_vat_lieu/material/type/material.type";

interface SuppliersTableProps {
  materials: Material[];
}

export const SuppliersTable: React.FC<SuppliersTableProps> = ({ materials }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useGetSuppliers();
  const deleteMutation = useDeleteSupplier();

  const filteredSuppliers = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return suppliers;
    return suppliers.filter(
      (sup) =>
        sup.name.toLowerCase().includes(s) ||
        sup.code.toLowerCase().includes(s) ||
        (sup.phone && sup.phone.includes(s)) ||
        (sup.contact_person && sup.contact_person.toLowerCase().includes(s)) ||
        sup.supplied_materials.some((sm) => sm.material_name.toLowerCase().includes(s))
    );
  }, [suppliers, searchTerm]);

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await deleteMutation.mutateAsync(deletingSupplier._id);
      setDeletingSupplier(null);
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1c1a17] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
          <input
            type="text"
            placeholder="Tìm theo tên nhà cung cấp, mã NCC, SĐT hoặc nguyên liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FiPlus className="w-3.5 h-3.5 text-stone-400" />
          <span>Thêm Nhà Cung Cấp</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#1c1a17] rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="text-center py-16 text-stone-400 dark:text-stone-500 text-xs">
            Đang tải dữ liệu nhà cung cấp...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 text-stone-400 dark:text-stone-500">
            <FiInbox className="w-8 h-8 mx-auto mb-2 text-stone-400" />
            <p className="text-xs">Chưa có nhà cung cấp nào trong danh sách</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px] bg-stone-50 dark:bg-[#25221e] font-semibold">
                  <th className="py-3 px-4">Nhà Cung Cấp</th>
                  <th className="py-3 px-4">Liên Hệ &amp; Đại Diện</th>
                  <th className="py-3 px-4">Nguyên Vật Liệu Cung Cấp</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition-colors"
                  >
                    {/* Nhà Cung Cấp */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-[#efe9de] text-xs">
                        {supplier.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-mono text-[10px] text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 font-semibold">
                          {supplier.code}
                        </span>
                        {supplier.address && (
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            <FiMapPin className="w-3 h-3 text-stone-400" />
                            {supplier.address}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Liên Hệ */}
                    <td className="py-3.5 px-4 space-y-1">
                      {supplier.contact_person && (
                        <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                          <FiUser className="w-3 h-3 text-stone-400" />
                          <span className="font-semibold">{supplier.contact_person}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                          <FiPhone className="w-3 h-3 text-stone-400" />
                          <a
                            href={`tel:${supplier.phone}`}
                            className="hover:text-stone-900 dark:hover:text-[#efe9de] font-mono"
                          >
                            {supplier.phone}
                          </a>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                          <FiMail className="w-3 h-3 text-stone-400" />
                          <a
                            href={`mailto:${supplier.email}`}
                            className="hover:text-stone-900 dark:hover:text-[#efe9de]"
                          >
                            {supplier.email}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Danh sách nguyên liệu */}
                    <td className="py-3.5 px-4">
                      {supplier.supplied_materials && supplier.supplied_materials.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {supplier.supplied_materials.map((sm, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-[11px] text-stone-700 dark:text-stone-300"
                            >
                              <span className="font-medium">{sm.material_name}</span>
                              {sm.supply_price ? (
                                <span className="text-stone-500 dark:text-stone-400 font-mono">
                                  ({sm.supply_price.toLocaleString("vi-VN")}đ)
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Chưa liên kết nguyên liệu</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          supplier.is_active
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/50"
                            : "bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-800"
                        }`}
                      >
                        {supplier.is_active ? "Đang hợp tác" : "Tạm ngưng"}
                      </span>
                    </td>

                    {/* Hành Động */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingSupplier(supplier)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <FiEdit3 className="w-3.5 h-3.5 text-stone-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSupplier(supplier)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                          title="Xóa nhà cung cấp"
                        >
                          <FiTrash2 className="w-3.5 h-3.5 text-stone-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateSupplierModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        materials={materials}
      />

      {/* Edit Modal */}
      <EditSupplierModal
        supplier={editingSupplier}
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        materials={materials}
      />

      {/* Delete Confirmation Modal using ConfirmModal */}
      <ConfirmModal
        isOpen={Boolean(deletingSupplier)}
        onCancel={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa nhà cung cấp"
        message={`Bạn có chắc chắn muốn xóa nhà cung cấp "${deletingSupplier?.name}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
