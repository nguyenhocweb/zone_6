"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaCloudUploadAlt,
  FaImage,
  FaTrash,
  FaLink,
  FaCheckCircle,
  FaFolder,
  FaSpinner,
} from "react-icons/fa";

interface RecipeImagePickerProps {
  value?: string | null;
  onChangeUrl: (url: string) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  itemId?: string;
  isUploading?: boolean;
}

export const RecipeImagePicker: React.FC<RecipeImagePickerProps> = ({
  value,
  onChangeUrl,
  selectedFile,
  onFileChange,
  itemId,
  isUploading = false,
}) => {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cập nhật preview khi selectedFile hoặc value thay đổi
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl("");
    }
  }, [selectedFile, value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn tệp hình ảnh (jpg, png, webp...)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Kích thước ảnh tối đa là 10MB");
        return;
      }
      onFileChange(file);
    }
  };

  const handleRemoveImage = () => {
    onFileChange(null);
    onChangeUrl("");
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayFolder = `zone_6/menu/${itemId || "{id món}"}`;

  return (
    <div className="space-y-2.5">
      {/* Header & Chọn chế độ */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
          <FaImage className="text-[#D4AF37]" />
          <span>Hình Ảnh Món Ăn / Sản Phẩm</span>
        </label>

        <div className="flex items-center gap-1 bg-[#12141A] p-0.5 rounded-lg border border-white/10 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mode === "file"
                ? "bg-[#D4AF37] text-[#0B0C10] font-bold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Tải từ máy
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mode === "url"
                ? "bg-[#D4AF37] text-[#0B0C10] font-bold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Dán URL
          </button>
        </div>
      </div>

      {/* Cloudinary Target Folder Badge */}
      <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-1.5 text-white/50">
          <FaFolder className="text-[#D4AF37]" />
          <span>Thư mục Cloudinary:</span>
          <span className="font-mono text-[#D4AF37] font-semibold">{displayFolder}</span>
        </div>
        <span className="text-[10px] text-white/40">Ký bảo mật SHA-1</span>
      </div>

      {/* Chế độ 1: Tải tệp từ máy tính */}
      {mode === "file" && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-[#D4AF37]/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#12141A]/50 hover:bg-[#12141A] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xl mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                <FaCloudUploadAlt />
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                Bấm để chọn ảnh từ máy tính hoặc thiết bị
              </p>
              <p className="text-[11px] text-white/40 mt-1">
                Hỗ trợ PNG, JPG, WEBP (Tối đa 10MB) • Tự động upload lên Cloudinary khi Lưu
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Chế độ 2: Dán đường dẫn URL */}
      {mode === "url" && (
        <div className="relative">
          <input
            type="url"
            value={value || ""}
            onChange={(e) => {
              onFileChange(null);
              onChangeUrl(e.target.value);
            }}
            placeholder="https://res.cloudinary.com/... hoặc dán link ảnh sản phẩm"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#12141A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          <FaLink className="absolute left-3 top-3 text-xs text-[#D4AF37]" />
        </div>
      )}

      {/* Vùng xem trước ảnh (Preview Card) */}
      {previewUrl && (
        <div className="relative p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
          <img
            src={previewUrl}
            alt="Preview món"
            className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]/40 shrink-0 bg-black/40"
          />

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {selectedFile ? selectedFile.name : "Ảnh món đã lưu"}
              </span>
              <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/50">
              {selectedFile ? (
                <>
                  <span className="font-mono font-medium text-[#D4AF37]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <span>•</span>
                  <span className="text-amber-400">Chờ bấm "Lưu" để upload Cloudinary</span>
                </>
              ) : (
                <span className="text-emerald-400 truncate block">{previewUrl}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "file" && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition"
              >
                Đổi ảnh
              </button>
            )}

            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
              title="Gỡ ảnh"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>

          {/* Loading overlay khi đang upload lên Cloudinary */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#D4AF37]">
              <FaSpinner className="animate-spin text-base" />
              <span>Đang xin chữ ký & tải lên Cloudinary...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

