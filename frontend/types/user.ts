export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "student" | "retraining" | "teacher" | "management"
  gender: 'male' | 'female' | 'other'
  age: number
  phone?: string
  department?: string
  position?: string
  createdAt: Date
  token?: string
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
  first_name: string
  last_name: string
  role: "student" | "retraining" | "teacher" | "management"
  gender: 'male' | 'female' | 'other'
  age: number
  phone?: string
  department?: string
  position?: string
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  email?: string
  role?: "student" | "retraining" | "teacher" | "management"
  gender?: 'male' | 'female' | 'other'
  age?: number
  phone?: string
  department?: string
  position?: string
}