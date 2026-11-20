"use client";

import React, { useEffect, useMemo } from "react";
import { FiHome, FiMapPin } from "react-icons/fi";
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

  useEffect(() => {
    if (stores.length === 0) return;

    if (!selectedStoreId) {
      if (user?.assigned_store_id) {
        onSelectStore(user.assigned_store_id);
      } else if (allowedStores.length > 0) {
        onSelectStore(allowedStores[0].id);
      }
    } else {
      const exists = allowedStores.some((s) => s.id === selectedStoreId);
      if (!exists && allowedStores.length > 0) {
        onSelectStore(allowedStores[0].id);
      }
    }
  }, [stores, user, selectedStoreId, allowedStores, onSelectStore]);

  if (isLoading && stores.length === 0) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="shrink-0 min-w-[280px] sm:min-w-[320px] bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 animate-pulse flex flex-col gap-2 shadow-sm"
          >
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-44"></div>
            <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-56"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2.5">
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
              className={`group shrink-0 flex flex-col justify-between p-4 rounded-2xl border text-left transition-all min-w-[280px] sm:min-w-[320px] max-w-[380px] ${
                isSelected
                  ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-stone-100 shadow-sm ring-1 ring-stone-900/10 dark:ring-stone-100/20"
                  : "bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
              } ${isAdminOrManager ? "cursor-pointer active:scale-[0.99]" : "cursor-default"}`}
            >
              {/* Top: Branch Name & Active Indicator */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs transition-colors ${
                      isSelected
                        ? "bg-stone-100 dark:bg-[#25221e] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800"
                        : "bg-stone-50 dark:bg-[#25221e] text-stone-400 border border-stone-200/60 dark:border-stone-800"
                    }`}
                  >
                    <FiHome />
                  </div>
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected
                        ? "text-stone-900 dark:text-[#efe9de]"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {store.store_name}
                  </span>
                </div>

                {isSelected ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900">
                    Đang chọn
                  </span>
                ) : store.store_code ? (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800 font-mono">
                    {store.store_code}
                  </span>
                ) : null}
              </div>

              {/* Bottom: Address */}
              <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-stone-500 dark:text-stone-400 truncate">
                <FiMapPin className="text-[11px] shrink-0 text-stone-400" />
                <span className="truncate">{store.address || "Chưa cập nhật địa chỉ"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
