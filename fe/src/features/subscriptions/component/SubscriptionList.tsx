"use client";

import React, { useState } from "react";
import { useGetSubscriptions } from "../hook/useGetSubscriptions";
import { useDeleteSubscription } from "../hook/useDeleteSubscription";
import { Subscription } from "../type/subscription.type";
import { SubscriptionStats } from "./SubscriptionStats";
import { CreateSubscriptionModal } from "./CreateSubscriptionModal";
import { UpdateSubscriptionModal } from "./UpdateSubscriptionModal";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheck, FaTimes, FaInbox } from "react-icons/fa";

export const SubscriptionList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [deletingSub, setDeletingSub] = useState<Subscription | null>(null);

  const { data, isLoading, isError } = useGetSubscriptions({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    is_active: isActiveFilter,
  });

  const { mutate: deleteSub, isPending: isDeleting } = useDeleteSubscription(() => {
    setDeletingSub(null);
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  return (
    <div className="w-full">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Quản Lý Gói Dịch Vụ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hệ thống quản lý CRUD chuẩn kiến trúc Enterprise (FastAPI + Next.js App Router).
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition"
        >
          <FaPlus /> Thêm Gói Mới
        </button>
      </div>

      {/* 2. KPI Cards */}
      <SubscriptionStats items={items} total={total} />

      {/* 3. Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm theo tên gói..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={isActiveFilter === undefined ? "ALL" : isActiveFilter ? "ACTIVE" : "INACTIVE"}
            onChange={(e) => {
              const val = e.target.value;
              setIsActiveFilter(val === "ALL" ? undefined : val === "ACTIVE");
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã tạm dừng</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value={5}>5 dòng / trang</option>
            <option value={10}>10 dòng / trang</option>
            <option value={20}>20 dòng / trang</option>
          </select>
        </div>
      </div>

      {/* 4. Table Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Tên Gói</th>
                <th className="px-6 py-4">Giá Tiền (VND)</th>
                <th className="px-6 py-4">Thời Hạn</th>
                <th className="px-6 py-4">Giới Hạn Dự Án</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-12" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-rose-500">
                    Có lỗi xảy ra khi kết nối tới Backend API! Vui lòng kiểm tra server FastAPI.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaInbox className="text-4xl text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Chưa có gói dịch vụ nào</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                        Bắt đầu bằng cách tạo gói dịch vụ đầu tiên trên hệ thống.
                      </p>
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                      >
                        <FaPlus /> Thêm Gói Ngay
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-400 font-normal line-clamp-1">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {item.price.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-6 py-4">{item.duration_days} ngày</td>
                    <td className="px-6 py-4">{item.max_projects} dự án</td>
                    <td className="px-6 py-4">
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                          <FaCheck className="text-[10px]" /> Kích hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <FaTimes className="text-[10px]" /> Tạm dừng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setEditingSub(item)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeletingSub(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Xóa gói"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Controls */}
        {total > 0 && (
          <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-700 dark:text-slate-300">{items.length}</span> trên tổng số{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">{total}</span> gói
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                Trang trước
              </button>
              <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Modals */}
      <CreateSubscriptionModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <UpdateSubscriptionModal
        isOpen={!!editingSub}
        subscription={editingSub}
        onClose={() => setEditingSub(null)}
      />
      <ConfirmModal
        isOpen={!!deletingSub}
        title="Xác nhận xóa gói dịch vụ"
        message={`Bạn có chắc chắn muốn xóa gói "${deletingSub?.name}" không? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa vĩnh viễn"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={() => {
          if (deletingSub) deleteSub(deletingSub.id);
        }}
        onCancel={() => setDeletingSub(null)}
      />
    </div>
  );
};
