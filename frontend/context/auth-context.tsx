"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  AuthState,
  LoginData,
  RegisterData,
  UpdateUserData,
} from "@/types/user";
import { apiService } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  useEffect(() => {
    // Восстанавливаем сессию из localStorage
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          token: savedToken,
        });

        // Валидируем токен, получая профиль
        apiService.getProfile(savedToken).catch(() => {
          // Если токен невалиден, очищаем
          logout();
        });
      } catch (error) {
        console.error("Error restoring auth state:", error);
        logout();
      }
    }
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      const response = await apiService.login({
        username: data.email,
        password: data.password,
      });

      // Получаем профиль пользователя
      const profile = await apiService.getProfile(response.access_token);

      const user: User = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        gender: profile.gender,
        age: profile.age,
        phone: profile.phone,
        department: profile.department,
        position: profile.position,
        createdAt: new Date(profile.createdAt),
        token: response.access_token,
      };

      setAuthState({
        user,
        isAuthenticated: true,
        token: response.access_token,
      });

      // Сохраняем в localStorage
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Неверный email или пароль");
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await apiService.register(data);

      // После регистрации автоматически логинимся
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(
        "Ошибка при регистрации. Возможно, пользователь с таким email уже существует."
      );
    }
  };

  const logout = (): void => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null,
    });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  const updateUser = async (updatedData: UpdateUserData): Promise<void> => {
    if (!authState.token || !authState.user) return;

    try {
      // Просто передаем данные для обновления, createdAt не включаем
      const updatedProfile = await apiService.updateProfile(
        authState.token,
        updatedData
      );

      const updatedUser: User = {
        ...authState.user,
        ...updatedData,
        createdAt: new Date(updatedProfile.createdAt),
      };

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update user error:", error);
      throw new Error("Ошибка при обновлении профиля");
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!authState.token) return;

    try {
      await apiService.deleteAccount(authState.token);
      logout();
    } catch (error) {
      console.error("Delete account error:", error);
      throw new Error("Ошибка при удалении аккаунта");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
