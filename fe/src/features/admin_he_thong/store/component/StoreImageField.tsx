"use client";

import React, { useState } from "react";
import { FiImage, FiTrash2, FiUpload } from "react-icons/fi";
import axiosClient from "@/core/api/axios-instance";
import { toast } from "sonner";

interface StoreImageFieldProps {
  value?: string | null;
  storeKey?: string;
  onChange: (url: string) => void;
}

export const StoreImageField: React.FC<StoreImageFieldProps> = ({
  value,
  storeKey,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const folder = `zone_6/stores/${(storeKey || "branch").toLowerCase().replace(/[^a-z0-9_-]/g, "")}`;
      const signRes = await axiosClient.post("/api/v1/cloudinary/sign", { folder });
      const sign = signRes.data?.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sign.api_key);
      formData.append("timestamp", String(sign.timestamp));
      formData.append("signature", sign.signature);
      formData.append("folder", sign.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const json = await uploadRes.json();
      onChange(json.secure_url);
      toast.success("Đã tải ảnh chi nhánh lên Cloudinary!");
    } catch {
      toast.error("Không thể tải ảnh chi nhánh lúc này.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
        <FiImage className="w-3.5 h-3.5 text-stone-400" />
        <span>Ảnh không gian chi nhánh (hiển thị trang chủ)</span>
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {value ? (
          <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
            <img src={value} alt="Ảnh chi nhánh" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
              title="Xóa ảnh"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-20 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#25221e] flex items-center justify-center text-[11px] text-stone-400 shrink-0">
            Chưa có ảnh
          </div>
        )}

        <div className="flex-1 w-full space-y-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer transition">
            <FiUpload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Đang tải lên..." : "Chọn ảnh từ máy"}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc dán link ảnh chi nhánh (https://...)"
            className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-[#efe9de] outline-none"
          />
        </div>
      </div>
    </div>
  );
};
