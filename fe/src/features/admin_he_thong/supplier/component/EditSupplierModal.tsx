"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaEdit,
  FaSearch,
  FaCheck,
  FaBoxes,
} from "react-icons/fa";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-[#161820] border border-[#D4AF37]/40 rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1c1f2b] to-[#161820]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#B89628]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FaEdit className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Chỉnh Sửa Nhà Cung Cấp: {supplier.code}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cập nhật thông tin đối tác & danh mục nguyên vật liệu cung ứng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Tên Nhà Cung Cấp <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Mã Nhà Cung Cấp
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Người Liên Hệ / Đại Diện
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Địa Chỉ Kho / Trụ Sở
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Ghi Chú & Điều Khoản Cung Ứng
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Chọn các nguyên liệu cung cấp */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Chọn Các Nguyên Vật Liệu Cung Cấp ({suppliedMaterials.length} đã chọn)
              </label>
              <div className="relative w-48">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                <input
                  type="text"
                  placeholder="Lọc nguyên liệu..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-[#12141a] border border-white/10 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto p-2 bg-[#12141a] rounded-xl border border-white/10 space-y-1.5">
              {filteredMaterials.map((mat) => {
                const matId = mat._id || mat.id || "";
                const isSelected = suppliedMaterials.some((sm) => sm.material_id === matId);
                const selectedItem = suppliedMaterials.find((sm) => sm.material_id === matId);

                return (
                  <div
                    key={matId}
                    className={`p-2 rounded-lg flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-white"
                        : "bg-[#181a24] border border-white/5 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                      onClick={() => handleToggleMaterial(mat)}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isSelected
                            ? "bg-[#D4AF37] text-black font-bold"
                            : "border border-gray-500"
                        }`}
                      >
                        {isSelected && <FaCheck />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{mat.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {mat.code} • {mat.unit}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-[10px] text-gray-400">Giá nhập:</span>
                        <input
                          type="number"
                          placeholder="Giá"
                          value={selectedItem?.supply_price ?? ""}
                          onChange={(e) =>
                            handlePriceChange(matId, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center py-0.5 bg-[#12141a] border border-[#D4AF37]/40 rounded text-xs text-white font-mono"
                        />
                        <span className="text-[10px] text-gray-400">đ</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#c4a132] text-black shadow-md transition-all flex items-center gap-2"
            >
              {updateMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
