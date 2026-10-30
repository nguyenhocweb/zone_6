"use client";

import React, { useEffect, useMemo } from "react";
import { FaStore } from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";

interface StoreInventorySelectorProps {
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
}

export const StoreInventorySelector: React.FC<StoreInventorySelectorProps> = ({
  selectedStoreId,
  onSelectStore,
}) => {
  const { user } = useAuth();
  const { data: storesData, isLoading } = useGetStores({ is_active: true });

  const stores = useMemo(() => storesData?.stores || [], [storesData]);

  const isAdminOrManager = useMemo(() => {
    if (!user) return false;
    return user.role === "admin_he_thong" || user.role === "quan_ly";
  }, [user]);

  // Danh sách cơ sở cho phép chọn
  const allowedStores = useMemo(() => {
    if (!user) return stores;
    if (user.role === "admin_he_thong") return stores;
    if (user.role === "quan_ly" && user.assigned_stores && user.assigned_stores.length > 0) {
      return stores.filter((s) => user.assigned_stores?.includes(s.id));
    }
    if (user.assigned_store_id) {
      return stores.filter((s) => s.id === user.assigned_store_id);
    }
    return stores;
  }, [user, stores]);

  // Tự động khởi tạo selectedStoreId
  useEffect(() => {
    if (stores.length === 0) return;

    if (!selectedStoreId) {
      if (user?.assigned_store_id) {
        onSelectStore(user.assigned_store_id);
      } else if (allowedStores.length > 0) {
        onSelectStore(allowedStores[0].id);
      }
    } else {
      // Đảm bảo selectedStoreId nằm trong danh sách cho phép
      const exists = allowedStores.some((s) => s.id === selectedStoreId);
      if (!exists && allowedStores.length > 0) {
        onSelectStore(allowedStores[0].id);
      }
    }
  }, [stores, user, selectedStoreId, allowedStores, onSelectStore]);

  const currentStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || allowedStores[0] || null;
  }, [stores, selectedStoreId, allowedStores]);

  if (isLoading && stores.length === 0) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto pb-2 gold-scrollbar-x">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="shrink-0 min-w-[280px] sm:min-w-[320px] bg-[#161820] border border-white/10 rounded-2xl p-3.5 animate-pulse flex flex-col gap-2"
          >
            <div className="h-4 bg-white/10 rounded w-44"></div>
            <div className="h-3 bg-white/10 rounded w-56"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Horizontal Cards Row */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2.5 gold-scrollbar-x">
        {allowedStores.map((store) => {
          const isSelected = store.id === selectedStoreId;

          return (
            <button
              key={store.id}
              type="button"
              onClick={() => isAdminOrManager && onSelectStore(store.id)}
              disabled={!isAdminOrManager}
              title={
                isAdminOrManager
                  ? `Chuyển sang xem kho ${store.store_name}`
                  : `Cơ sở trực thuộc cố định: ${store.store_name}`
              }
              className={`group shrink-0 flex flex-col justify-center p-3.5 px-4 rounded-2xl border text-left transition-all duration-200 min-w-[280px] sm:min-w-[320px] max-w-[380px] ${
                isSelected
                  ? "bg-gradient-to-r from-amber-500/15 via-[#1C1B16] to-[#14161E] border-[#D4AF37] shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40"
                  : "bg-[#14161E] hover:bg-[#1A1D26] border-white/10 hover:border-amber-400/40 opacity-75 hover:opacity-100"
              } ${isAdminOrManager ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : "cursor-default"}`}
            >
              {/* Top: Branch Name & Active Indicator */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs transition-colors ${
                      isSelected
                        ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                        : "bg-white/5 text-white/50 border border-white/10 group-hover:text-amber-400 group-hover:border-amber-400/30"
                    }`}
                  >
                    <FaStore />
                  </div>
                  <span
                    className={`text-xs font-black truncate ${
                      isSelected
                        ? "text-amber-300"
                        : "text-white group-hover:text-amber-200"
                    }`}
                  >
                    {store.store_name}
                  </span>
                </div>

                {/* Right Badge */}
                {isSelected ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Đang chọn</span>
                  </span>
                ) : store.store_code ? (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-white/40 border border-white/10">
                    {store.store_code}
                  </span>
                ) : null}
              </div>

              {/* Bottom: Address */}
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/50 group-hover:text-white/70 truncate">
                <span className="text-amber-400/70 text-[10px] shrink-0">📍</span>
                <span className="truncate">{store.address || "Chưa cập nhật địa chỉ"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

