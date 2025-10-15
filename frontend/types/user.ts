export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  gender: 'male' | 'female' | 'other'
  age: number
  phone?: string
  department?: string
  position?: string
  createdAt: Date
  token?: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  role?: 'student' | 'teacher' | 'admin'
  gender?: 'male' | 'female' | 'other'
  age?: number
  phone?: string
  department?: string
  position?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  gender: 'male' | 'female' | 'other'
  age: number
  phone?: string
  department?: string
  position?: string
}