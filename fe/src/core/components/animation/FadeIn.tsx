"use client";

import React from "react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, className = "", delayMs = 0 }) => {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className={`transition-all duration-500 animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
};
