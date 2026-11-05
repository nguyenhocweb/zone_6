"use client";

import React, { useState, useMemo } from "react";
import {
  FaClipboardCheck,
  FaCalendarAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaBoxes,
  FaHistory,
  FaUserTie,
  FaUser,
  FaStore,
  FaClock,
  FaCog,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetMaterials } from "../hook/useGetMaterials";
import { useGetInventoryAudits } from "../hook/useInventoryAudits";
import { StoreInventorySelector } from "./StoreInventorySelector";
import { InventoryAuditModal } from "./InventoryAuditModal";
import { InventoryAuditDetailModal } from "./InventoryAuditDetailModal";
import { InventoryAuditConfigModal } from "./InventoryAuditConfigModal";
import type { InventoryAudit } from "../type/inventory-audit.type";

const ROLE_LABEL_MAP: Record<string, string> = {
  admin_he_thong: "Admin Hệ Thống",
  quan_ly: "Quản Lý",
  truong_ca: "Trưởng Ca",
  pho_ca_vat_lieu: "Phó Ca Vật Liệu",
  pho_ca_lam_lich: "Phó Ca Làm Lịch",
  nhan_vien: "Nhân Viên",
};

export const InventoryAuditView: React.FC = () => {
  const { user } = useAuth();

  // Multi-Store Branch Scope State
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Selected date filter (default: today YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [dateFilter, setDateFilter] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(null);

  // Query materials for audit
  const { data: materialsData } = useGetMaterials({
    store_id: selectedStoreId || undefined,
  });
  const materials = useMemo(() => materialsData?.materials || [], [materialsData]);

  // Query audits
  const { data: audits = [], isLoading } = useGetInventoryAudits({
    store_id: selectedStoreId || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    date: dateFilter || undefined,
  });

  // Filter client-side by search
  const filteredAudits = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return audits;
    return audits.filter(
      (a) =>
        a.audit_code.toLowerCase().includes(s) ||
        a.created_by_name.toLowerCase().includes(s) ||
        (a.created_by_user_code && a.created_by_user_code.toLowerCase().includes(s)) ||
        (a.created_by_email && a.created_by_email.toLowerCase().includes(s)) ||
        (a.audit_shift && a.audit_shift.toLowerCase().includes(s)) ||
        (a.reviewed_by_name && a.reviewed_by_name.toLowerCase().includes(s))
    );
  }, [audits, searchTerm]);

  // Kiểm tra quyền: Phó ca trở lên mới có quyền sửa và đồng bộ
  const canEditAndSync = useMemo(() => {
    if (!user) return false;
    return [
      "pho_ca_vat_lieu",
      "pho_ca_lam_lich",
      "truong_ca",
      "quan_ly",
      "admin_he_thong",
    ].includes(user.role);
  }, [user]);

  // Quyền cấu hình kiểm kho: Admin, Quản Lý, Phó Ca Vật Liệu
  const canConfigure = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly", "pho_ca_vat_lieu"].includes(user.role);
  }, [user]);

  // Thống kê nhanh theo ngày đang chọn
  const metrics = useMemo(() => {
    const totalAudits = audits.length;
    let totalDiscrepancies = 0;
    const auditorMap = new Map<string, { name: string; code?: string | null; role: string }>();

    audits.forEach((a) => {
      totalDiscrepancies += a.discrepancy_count || 0;
      if (!auditorMap.has(a.created_by_id)) {
        auditorMap.set(a.created_by_id, {
          name: a.created_by_name,
          code: a.created_by_user_code,
          role: a.created_by_role,
        });
      }
    });

    return {
      totalAudits,
      totalDiscrepancies,
      auditors: Array.from(auditorMap.values()),
    };
  }, [audits]);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* ============================================================== */}
      {/* 1. TOP HEADER BANNER */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161820] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center gap-1.5">
              <FaClipboardCheck />
              <span>Phân Hệ Kiểm Kê Kho Thực Tế & Cấu Hình Ca Kiểm</span>
            </span>
            {user && (
              <span className="text-xs text-white/50">
                Tài khoản: <strong className="text-white">{user.name || user.role}</strong>
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Kiểm Kê Kho & Quản Lý Chu Kỳ Kiểm
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
            Hỗ trợ phân quyền người tạo / người duyệt, cấu hình ca kiểm kho trong ngày,
            định kỳ kiểm hàng ngày hoặc N ngày 1 lần và ghi nhận chính xác tài khoản nhân viên kiểm kho.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex flex-wrap items-center gap-3">
          {canConfigure && (
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaCog className="text-sm text-[#D4AF37]" />
              <span>⚙️ Cấu Hình Kiểm Kho</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaClipboardCheck className="text-base" />
            <span>+ Bắt Đầu Kiểm Kê Kho</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MULTI-STORE BRANCH SELECTOR */}
      {/* ============================================================== */}
      <StoreInventorySelector
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
      />

      {/* ============================================================== */}
      {/* 3. TÀI KHOẢN & NGƯỜI KIỂM KHO NGÀY HÔM NAY (WIDGET ĐẶC TẢ) */}
      {/* ============================================================== */}
      <div className="bg-[#161820] border border-[#D4AF37]/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-lg">
              <FaUserCheck />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Nhật Ký Người Kiểm Kho Theo Ngày</span>
                <span className="text-xs font-normal text-gray-400">
                  (Tra cứu tài khoản nào đã kiểm kho)
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Xem chi tiết danh tính nhân viên, mã tài khoản, thời điểm và số mặt hàng chênh lệch
              </p>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDateFilter(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilter === todayStr
                  ? "bg-[#D4AF37] text-black shadow-md font-bold"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              Hôm nay ({todayStr.slice(5)})
            </button>

            <button
              type="button"
              onClick={() => setDateFilter("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilter === ""
                  ? "bg-[#D4AF37] text-black shadow-md font-bold"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              Tất cả thời gian
            </button>

            <div className="flex items-center gap-1.5 bg-[#12141a] px-2.5 py-1 rounded-xl border border-white/10">
              <FaCalendarAlt className="text-gray-400 text-xs" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-white text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Auditor List Today Cards */}
        <div className="mt-4">
          {metrics.auditors.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs">
              Chưa có nhân viên nào thực hiện kiểm kê kho vào ngày này.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {metrics.auditors.map((auditor, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#B89628]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm shrink-0">
                    <FaUserTie />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-xs truncate">
                      {auditor.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {auditor.code && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#D4AF37] font-semibold">
                          {auditor.code}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 truncate">
                        ({ROLE_LABEL_MAP[auditor.role] || auditor.role})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. METRICS CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Tổng Phiếu Kiểm Kho</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {metrics.totalAudits}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <FaClipboardCheck />
          </div>
        </div>

        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Nhân Sự Đã Kiểm Hôm Nay</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {metrics.auditors.length} <span className="text-xs font-normal text-gray-400">người</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FaUserCheck />
          </div>
        </div>

        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Tổng Mặt Hàng Chênh Lệch</div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {metrics.totalDiscrepancies} <span className="text-xs font-normal text-gray-400">món</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FaExclamationTriangle />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. SEARCH, FILTER & TABLE PHIẾU KIỂM KHO */}
      {/* ============================================================== */}
      <div className="bg-[#161820] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, ca kiểm, tên nhân viên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#12141a] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 shrink-0">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#12141a] text-white text-xs px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending_review">Chờ kiểm tra</option>
              <option value="adjusted">Đã qua chỉnh sửa</option>
              <option value="confirmed">Đã đồng bộ tồn kho</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            Đang tải danh sách phiếu kiểm kho...
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            Không tìm thấy phiếu kiểm kho nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#12141a] text-gray-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Mã Phiếu & Ngày Giờ</th>
                  <th className="py-3 px-4">Ca Kiểm Kho</th>
                  <th className="py-3 px-4">Tài Khoản Kiểm Kho</th>
                  <th className="py-3 px-4 text-center">Mặt Hàng Kiểm</th>
                  <th className="py-3 px-4 text-center">Chênh Lệch</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Người Duyệt / Chỉnh Sửa</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAudits.map((audit) => (
                  <tr
                    key={audit._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Mã Phiếu & Ngày Giờ */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#D4AF37] text-sm">
                        {audit.audit_code}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                        <FaClock className="text-[10px] text-gray-500" />
                        <span>{new Date(audit.created_at).toLocaleString("vi-VN")}</span>
                      </div>
                    </td>

                    {/* Ca Kiểm Kho */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                        <FaClock className="text-[10px]" />
                        <span>{audit.audit_shift || "Ca tự do"}</span>
                      </span>
                    </td>

                    {/* Tài Khoản Kiểm Kho (ĐẶC TẢ) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0">
                          👤
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {audit.created_by_name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {audit.created_by_user_code ? (
                              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-white/10 text-[#D4AF37] border border-white/10">
                                {audit.created_by_user_code}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-gray-400">
                              ({ROLE_LABEL_MAP[audit.created_by_role] || audit.created_by_role})
                            </span>
                          </div>
                          {audit.created_by_email && (
                            <div className="text-[10px] text-gray-500 font-mono">
                              {audit.created_by_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Số mặt hàng kiểm */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-white">
                      {audit.total_items_checked} món
                    </td>

                    {/* Chênh Lệch */}
                    <td className="py-3.5 px-4 text-center">
                      {audit.discrepancy_count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                          <FaExclamationTriangle className="text-[10px]" />
                          <span>{audit.discrepancy_count} món lệch</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <FaCheckCircle className="text-[10px]" />
                          <span>Cân bằng</span>
                        </span>
                      )}
                    </td>

                    {/* Trạng Thái */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          audit.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : audit.status === "adjusted"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {audit.status === "confirmed"
                          ? "Đã đồng bộ tồn kho"
                          : audit.status === "adjusted"
                          ? "Đã qua chỉnh sửa"
                          : "Chờ kiểm tra"}
                      </span>
                    </td>

                    {/* Người Duyệt / Chỉnh Sửa */}
                    <td className="py-3.5 px-4">
                      {audit.reviewed_by_name ? (
                        <div>
                          <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>{audit.reviewed_by_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                            {audit.reviewed_by_user_code && (
                              <span className="font-mono text-[#D4AF37]">
                                {audit.reviewed_by_user_code}
                              </span>
                            )}
                            {audit.reviewed_by_role && (
                              <span>({ROLE_LABEL_MAP[audit.reviewed_by_role] || audit.reviewed_by_role})</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-[11px]">Chờ duyệt</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAudit(audit)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                          canEditAndSync && audit.status !== "confirmed"
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-black hover:brightness-110 shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-white"
                        }`}
                      >
                        {canEditAndSync && audit.status !== "confirmed" ? (
                          <>
                            <FaEdit className="text-xs" /> Sửa & Duyệt
                          </>
                        ) : (
                          <>
                            <FaEye className="text-xs" /> Xem phiếu
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 6. MODALS */}
      {/* ============================================================== */}
      <InventoryAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        materials={materials}
        selectedStoreId={selectedStoreId}
      />

      <InventoryAuditDetailModal
        audit={selectedAudit}
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
      />

      <InventoryAuditConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        selectedStoreId={selectedStoreId}
      />
    </div>
  );
};
