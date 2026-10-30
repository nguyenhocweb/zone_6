"use client";

import React, { useState, useMemo } from "react";
import {
  FaTruckLoading,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaBoxOpen,
} from "react-icons/fa";
import { useGetSuppliers, useDeleteSupplier } from "../hook/useSuppliers";
import { CreateSupplierModal } from "./CreateSupplierModal";
import { EditSupplierModal } from "./EditSupplierModal";
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161820] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Tìm theo tên nhà cung cấp, mã NCC, SĐT hoặc nguyên liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#12141a] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-black shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <FaPlus className="text-xs" /> Thêm Nhà Cung Cấp
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-[#161820] rounded-2xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Đang tải dữ liệu nhà cung cấp...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaBoxOpen className="text-4xl mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Chưa có nhà cung cấp nào trong danh sách</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[11px] bg-white/[0.02]">
                  <th className="py-3 px-4">Nhà Cung Cấp</th>
                  <th className="py-3 px-4">Liên Hệ & Đại Diện</th>
                  <th className="py-3 px-4">Nguyên Vật Liệu Cung Cấp</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Nhà Cung Cấp */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">
                        {supplier.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                          {supplier.code}
                        </span>
                        {supplier.address && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[10px] text-gray-500" />
                            {supplier.address}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Liên Hệ */}
                    <td className="py-3 px-4 space-y-1">
                      {supplier.contact_person && (
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <FaUser className="text-[10px] text-[#D4AF37]" />
                          <span className="font-medium">{supplier.contact_person}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <FaPhoneAlt className="text-[10px] text-emerald-400" />
                          <a
                            href={`tel:${supplier.phone}`}
                            className="hover:text-white font-mono"
                          >
                            {supplier.phone}
                          </a>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <FaEnvelope className="text-[10px] text-blue-400" />
                          <a
                            href={`mailto:${supplier.email}`}
                            className="hover:text-white"
                          >
                            {supplier.email}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Danh sách nguyên liệu */}
                    <td className="py-3 px-4">
                      {supplier.supplied_materials && supplier.supplied_materials.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {supplier.supplied_materials.map((sm, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#12141a] border border-white/10 text-[11px] text-gray-300"
                            >
                              <span className="font-medium text-white">{sm.material_name}</span>
                              {sm.supply_price ? (
                                <span className="text-[#D4AF37] font-mono">
                                  ({sm.supply_price.toLocaleString("vi-VN")}đ)
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Chưa liên kết nguyên liệu</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          supplier.is_active
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {supplier.is_active ? "Đang hợp tác" : "Tạm ngưng"}
                      </span>
                    </td>

                    {/* Hành Động */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingSupplier(supplier)}
                          className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSupplier(supplier)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Xóa nhà cung cấp"
                        >
                          <FaTrashAlt className="text-sm" />
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

      {/* Delete Confirmation Modal */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeletingSupplier(null)}
          />
          <div className="relative w-full max-w-md bg-[#161820] border border-red-500/30 rounded-2xl p-5 shadow-2xl z-10 space-y-4">
            <h4 className="text-base font-bold text-white">Xác nhận xóa nhà cung cấp</h4>
            <p className="text-xs text-gray-300">
              Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
              <strong className="text-white font-semibold">"{deletingSupplier.name}"</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSupplier(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
