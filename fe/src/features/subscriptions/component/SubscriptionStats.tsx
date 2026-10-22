"use client";

import React from "react";
import { Subscription } from "../type/subscription.type";
import { FaBoxOpen, FaCheckCircle, FaLayerGroup, FaCoins } from "react-icons/fa";

interface Props {
  items: Subscription[];
  total: number;
}

export const SubscriptionStats: React.FC<Props> = ({ items, total }) => {
  const activeCount = items.filter((i) => i.is_active).length;
  const avgPrice =
    items.length > 0
      ? Math.round(items.reduce((acc, cur) => acc + cur.price, 0) / items.length)
      : 0;
  const totalMaxProjects = items.reduce((acc, cur) => acc + cur.max_projects, 0);

  const stats = [
    {
      title: "Tổng số gói",
      value: total,
      sub: "Đang lưu trên hệ thống",
      icon: <FaBoxOpen className="text-indigo-500 text-2xl" />,
      bg: "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50",
    },
    {
      title: "Gói kích hoạt",
      value: activeCount,
      sub: "Khách hàng có thể đăng ký",
      icon: <FaCheckCircle className="text-emerald-500 text-2xl" />,
      bg: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50",
    },
    {
      title: "Giá trung bình",
      value: `${avgPrice.toLocaleString("vi-VN")} đ`,
      sub: "Mức giá gói phổ thông",
      icon: <FaCoins className="text-amber-500 text-2xl" />,
      bg: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50",
    },
    {
      title: "Tổng Slot Dự Án",
      value: totalMaxProjects,
      sub: "Khả năng phân bổ",
      icon: <FaLayerGroup className="text-violet-500 text-2xl" />,
      bg: "bg-violet-50/60 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-md ${stat.bg}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {stat.title}
            </span>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stat.value}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
};
