import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/core/providers/QueryProvider";
import { AuthProvider } from "@/features/auth/hook/useAuth";
import { Toaster } from "sonner";
import { AppShell } from "@/core/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zone 6 - Xếp Lịch Làm Việc & Zalo Bot",
  description: "Hệ thống quản lý, xếp lịch tự động Zone 6 và tích hợp Zalo cá nhân",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark h-full antialiased" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className={`${inter.className} min-h-full bg-[#0B0C10] text-[#F4F5F8] flex flex-col`} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
