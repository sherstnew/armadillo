"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthState, LoginData, RegisterData } from '@/types/user'

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  // Mock данные для демонстрации
  const mockUser: User = {
    id: '1',
    email: 'demo@mtu.ru',
    firstName: 'Иван',
    lastName: 'Иванов',
    role: 'student',
    createdAt: new Date(),
  }

  useEffect(() => {
    // Проверяем, есть ли сохраненная сессия
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setAuthState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      })
    }
  }, [])

  const login = async (data: LoginData): Promise<void> => {
    // Mock логика входа
    if (data.email && data.password) {
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
      })
      localStorage.setItem('user', JSON.stringify(mockUser))
    } else {
      throw new Error('Неверные учетные данные')
    }
  }

  const register = async (data: RegisterData): Promise<void> => {
    // Mock логика регистрации
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date(),
    }

    setAuthState({
      user: newUser,
      isAuthenticated: true,
    })
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = (): void => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    })
    localStorage.removeItem('user')
  }

  const updateUser = (updatedData: Partial<User>): void => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updatedData }
      setAuthState({
        ...authState,
        user: updatedUser,
      })
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const deleteAccount = async (): Promise<void> => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    })
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUser,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}