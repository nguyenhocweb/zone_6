"use client";

import React, { useState, useMemo } from "react";
import {
  FaTimes,
  FaTruckLoading,
  FaSearch,
  FaCheck,
  FaPlus,
  FaTrashAlt,
  FaBoxes,
} from "react-icons/fa";
import { useCreateSupplier } from "../hook/useSuppliers";
import type { SuppliedMaterial } from "../type/supplier.type";
import type { Material } from "@/features/pho_ca_vat_lieu/material/type/material.type";
import { toast } from "sonner";

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
}

export const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({
  isOpen,
  onClose,
  materials,
}) => {
  const createMutation = useCreateSupplier();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Selected supplied materials
  const [suppliedMaterials, setSuppliedMaterials] = useState<SuppliedMaterial[]>([]);
  const [materialSearch, setMaterialSearch] = useState("");

  const resetForm = () => {
    setCode("");
    setName("");
    setPhone("");
    setEmail("");
    setContactPerson("");
    setAddress("");
    setNotes("");
    setIsActive(true);
    setSuppliedMaterials([]);
    setMaterialSearch("");
  };

  // Lọc danh sách vật tư có thể chọn
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
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: code.trim() || undefined,
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        contact_person: contactPerson.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
        is_active: isActive,
        supplied_materials: suppliedMaterials,
      });
      resetForm();
      onClose();
    } catch {
      // Handled by toast
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-[#161820] border border-[#D4AF37]/40 rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1c1f2b] to-[#161820]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#B89628]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FaTruckLoading className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Thêm Mới Nhà Cung Cấp
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Chức năng dành riêng cho Quản Lý & Admin Hệ Thống
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Tên Nhà Cung Cấp <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Công ty TNHH Bao Bì Phúc Thịnh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Mã Nhà Cung Cấp (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Tự sinh nếu bỏ trống (NCC-001)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Người Liên Hệ / Đại Diện
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Anh Tuấn (Kinh doanh)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="kinhdoanh@phucthinh.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Địa Chỉ Kho / Trụ Sở
              </label>
              <input
                type="text"
                placeholder="Số 45, Đường 3/2, Quận 10, TP.HCM"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Ghi Chú & Điều Khoản Cung Ứng
            </label>
            <textarea
              rows={2}
              placeholder="Chính sách giao hàng, công nợ 15 ngày, chiết khấu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#12141a] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
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

            {/* List of materials to toggle */}
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

          {/* Action buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#c4a132] text-black shadow-md transition-all flex items-center gap-2"
            >
              {createMutation.isPending ? "Đang lưu..." : "Thêm Nhà Cung Cấp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
