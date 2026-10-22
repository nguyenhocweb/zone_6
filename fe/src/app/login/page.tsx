"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/component/LoginForm";
import { useAuth } from "@/features/auth/hook/useAuth";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0C10]">
      <LoginForm />
    </div>
  );
}
