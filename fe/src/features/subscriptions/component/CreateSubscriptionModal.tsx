"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  subscriptionCreateSchema,
  SubscriptionCreateFormValues,
} from "../schema/subscription.create.schema";
import { useCreateSubscription } from "../hook/useCreateSubscription";
import { FaTimes, FaPlus } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSubscriptionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionCreateFormValues>({
    resolver: zodResolver(subscriptionCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 100000,
      duration_days: 30,
      max_projects: 1,
    },
  });

  const { mutate: createSub, isPending } = useCreateSubscription(() => {
    reset();
    onClose();
  });

  if (!isOpen || !mounted) return null;

  const onSubmit = (values: SubscriptionCreateFormValues) => {
    createSub(values);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FaPlus />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm Gói Dịch Vụ Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Tên Gói Dịch Vụ <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="VD: Gói Khởi Nghiệp, Gói Doanh Nghiệp..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Mô Tả Gói
            </label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="Mô tả các quyền lợi, tính năng nổi bật..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Giá (VND) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Thời Hạn (Ngày) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                {...register("duration_days", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.duration_days && (
                <p className="text-xs text-rose-500 mt-1">{errors.duration_days.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Số Dự Án <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                {...register("max_projects", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.max_projects && (
                <p className="text-xs text-rose-500 mt-1">{errors.max_projects.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : "Lưu Gói Dịch Vụ"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
