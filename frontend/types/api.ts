export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
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

export interface RegisterResponse {
  user_token: string
}

export interface UserProfile {
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
  createdAt: string
}

export interface UpdateProfileRequest {
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