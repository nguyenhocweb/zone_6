"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiX,
  FiEdit3,
  FiSearch,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { useUpdateSupplier } from "../hook/useSuppliers";
import type { Supplier, SuppliedMaterial } from "../type/supplier.type";
import type { Material } from "@/features/pho_ca_vat_lieu/material/type/material.type";
import { toast } from "sonner";

interface EditSupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  supplier,
  isOpen,
  onClose,
  materials,
}) => {
  const updateMutation = useUpdateSupplier();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [suppliedMaterials, setSuppliedMaterials] = useState<SuppliedMaterial[]>([]);
  const [materialSearch, setMaterialSearch] = useState("");

  useEffect(() => {
    if (supplier) {
      setCode(supplier.code || "");
      setName(supplier.name || "");
      setPhone(supplier.phone || "");
      setEmail(supplier.email || "");
      setContactPerson(supplier.contact_person || "");
      setAddress(supplier.address || "");
      setNotes(supplier.notes || "");
      setIsActive(supplier.is_active ?? true);
      setSuppliedMaterials(supplier.supplied_materials || []);
    }
  }, [supplier]);

  const filteredMaterials = useMemo(() => {
    const s = materialSearch.toLowerCase().trim();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(s) ||
        m.code.toLowerCase().includes(s) ||
        m.category.toLowerCase().includes(s)
    );
  }, [materials, materialSearch]);

  const handleToggleMaterial = (mat: Material) => {
    const matId = mat._id || mat.id || "";
    const exists = suppliedMaterials.find((sm) => sm.material_id === matId);

    if (exists) {
      setSuppliedMaterials((prev) => prev.filter((sm) => sm.material_id !== matId));
    } else {
      setSuppliedMaterials((prev) => [
        ...prev,
        {
          material_id: matId,
          material_code: mat.code,
          material_name: mat.name,
          category: (mat.category as any) || "ingredient",
          unit: mat.unit,
          supply_price: mat.cost_per_unit || null,
        },
      ]);
    }
  };

  const handlePriceChange = (matId: string, price: number) => {
    setSuppliedMaterials((prev) =>
      prev.map((sm) =>
        sm.material_id === matId ? { ...sm, supply_price: price } : sm
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: supplier._id,
        payload: {
          code: code.trim() || undefined,
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          contact_person: contactPerson.trim() || null,
          address: address.trim() || null,
          notes: notes.trim() || null,
          is_active: isActive,
          supplied_materials: suppliedMaterials,
        },
      });
      onClose();
    } catch {
      // Handled by toast
    }
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#25221e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-sm shadow-xs shrink-0">
              <FiEdit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
                Chỉnh Sửa Nhà Cung Cấp: {supplier.code}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Cập nhật thông tin đối tác &amp; danh mục nguyên vật liệu cung ứng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <FiX className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Tên Nhà Cung Cấp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Mã Nhà Cung Cấp
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Người Liên Hệ / Đại Diện
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Địa Chỉ Kho / Trụ Sở
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
              Ghi Chú &amp; Điều Khoản Cung Ứng
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
            />
          </div>

          {/* Chọn các nguyên liệu cung cấp */}
          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Chọn Các Nguyên Vật Liệu Cung Cấp ({suppliedMaterials.length} đã chọn)
              </label>
              <div className="relative w-48">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                <input
                  type="text"
                  placeholder="Lọc nguyên liệu..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-lg text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto p-2 bg-stone-50/70 dark:bg-[#25221e] rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-1.5">
              {filteredMaterials.map((mat) => {
                const matId = mat._id || mat.id || "";
                const isSelected = suppliedMaterials.some((sm) => sm.material_id === matId);
                const selectedItem = suppliedMaterials.find((sm) => sm.material_id === matId);

                return (
                  <div
                    key={matId}
                    className={`p-2 rounded-xl flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-[#efe9de]"
                        : "bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800/60 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                      onClick={() => handleToggleMaterial(mat)}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isSelected
                            ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-bold"
                            : "border border-stone-300 dark:border-stone-600"
                        }`}
                      >
                        {isSelected && <FiCheck className="w-3 h-3 text-stone-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{mat.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {mat.code} • {mat.unit}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">Giá nhập:</span>
                        <input
                          type="number"
                          placeholder="Giá"
                          value={selectedItem?.supply_price ?? ""}
                          onChange={(e) =>
                            handlePriceChange(matId, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center py-0.5 bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:outline-none"
                        />
                        <span className="text-[10px] text-stone-400">đ</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <FiLoader className="w-3.5 h-3.5 animate-spin text-stone-400" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
