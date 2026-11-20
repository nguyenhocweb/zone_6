"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FiUploadCloud,
  FiImage,
  FiTrash2,
  FiLink,
  FiCheckCircle,
  FiFolder,
  FiLoader,
} from "react-icons/fi";
import { toast } from "sonner";

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
        toast.error("Vui lòng chọn tệp hình ảnh (jpg, png, webp...)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước ảnh tối đa là 10MB");
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
    <div className="space-y-2.5 text-stone-900 dark:text-[#efe9de]">
      {/* Header & Chọn chế độ */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <FiImage className="text-stone-400" />
          <span>Hình Ảnh Món Ăn / Sản Phẩm</span>
        </label>

        <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#25221e] p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              mode === "file"
                ? "bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] font-semibold shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
            }`}
          >
            Tải từ máy
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              mode === "url"
                ? "bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] font-semibold shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
            }`}
          >
            Dán URL
          </button>
        </div>
      </div>

      {/* Cloudinary Target Folder Badge */}
      <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e]/50 border border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
          <FiFolder className="text-stone-400" />
          <span>Thư mục Cloudinary:</span>
          <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold">{displayFolder}</span>
        </div>
        <span className="text-[10px] text-stone-400">Ký bảo mật SHA-1</span>
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
              className="border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 rounded-2xl p-6 text-center cursor-pointer transition-all bg-stone-50/50 hover:bg-stone-50 dark:bg-[#25221e]/30 dark:hover:bg-[#25221e]/60 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 text-lg mx-auto mb-2.5 group-hover:scale-105 transition-transform">
                <FiUploadCloud className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                Bấm để chọn ảnh từ máy tính hoặc thiết bị
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
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
            className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 transition-colors"
          />
          <FiLink className="absolute left-3 top-2.5 text-xs text-stone-400" />
        </div>
      )}

      {/* Vùng xem trước ảnh (Preview Card) */}
      {previewUrl && (
        <div className="relative p-3 rounded-2xl bg-stone-50 dark:bg-[#25221e]/60 border border-stone-200/80 dark:border-stone-800 flex items-center gap-3">
          <img
            src={previewUrl}
            alt="Preview món"
            className="w-16 h-16 rounded-xl object-cover border border-stone-200/80 dark:border-stone-700/60 shrink-0 bg-stone-100 dark:bg-stone-800"
          />

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 dark:text-[#efe9de] truncate">
                {selectedFile ? selectedFile.name : "Ảnh món đã lưu"}
              </span>
              <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xs shrink-0" />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
              {selectedFile ? (
                <>
                  <span className="font-mono font-medium text-stone-700 dark:text-stone-300">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400">Chờ bấm &quot;Lưu&quot; để upload Cloudinary</span>
                </>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 truncate block font-mono text-[10px]">{previewUrl}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "file" && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-[#1c1a17] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 text-[11px] font-semibold border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer"
              >
                Đổi ảnh
              </button>
            )}

            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition cursor-pointer"
              title="Gỡ ảnh"
            >
              <FiTrash2 className="text-xs" />
            </button>
          </div>

          {/* Loading overlay khi đang upload lên Cloudinary */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-white">
              <FiLoader className="animate-spin text-base" />
              <span>Đang tải lên Cloudinary...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
