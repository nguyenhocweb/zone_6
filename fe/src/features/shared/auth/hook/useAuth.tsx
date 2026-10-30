"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  changePasswordService,
  getMeService,
  loginService,
  logoutService,
  refreshTokenService,
  updateMeService,
} from "../service/auth.service";
import type {
  ChangePasswordPayload,
  LoginPayload,
  UpdateProfilePayload,
  UserProfile,
} from "../type/auth.type";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "zone6_token";
const USER_KEY = "zone6_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Khôi phục phiên làm việc tự động qua Cookie & Database Refresh Token
  useEffect(() => {
    // 1. Thử gọi /me với Cookie hiện có
    getMeService()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        // 2. Nếu Access Token hết hạn, tự động gọi /refresh từ Database
        return refreshTokenService()
          .then((refreshed) => {
            setUser(refreshed.user);
            setToken(refreshed.token);
            localStorage.setItem(USER_KEY, JSON.stringify(refreshed.user));
            localStorage.setItem(TOKEN_KEY, refreshed.token);
          })
          .catch(() => {
            // Không có cookie hoặc phiên đã bị thu hồi
            setUser(null);
            setToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      const data = await loginService(payload);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      toast.success(
        `Đăng nhập thành công! Xin chào ${data.user.name} • [${data.user.role_label}]`
      );
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      toast.error(msg);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
    toast.info("Đã đăng xuất khỏi tài khoản");
  };

  const checkSession = async () => {
    try {
      const freshUser = await getMeService();
      setUser(freshUser);
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch {
      await logout();
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      const updated = await updateMeService(payload);
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      toast.success("Cập nhật hồ sơ thông tin cá nhân thành công!");
      return true;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Cập nhật hồ sơ thông tin cá nhân thất bại. Vui lòng thử lại!";
      toast.error(msg);
      return false;
    }
  };

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    try {
      const res = await changePasswordService(payload);
      toast.success(res.message || "Đổi mật khẩu thành công!");
      return true;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!";
      toast.error(msg);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticating,
        login,
        logout,
        checkSession,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
