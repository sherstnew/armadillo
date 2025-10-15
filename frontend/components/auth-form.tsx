"use client"

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogIn, UserPlus, Mail, Lock, User, Users } from 'lucide-react'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'teacher' | 'admin'
  })
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password })
      } else {
        await register(formData)
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md border shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            {isLogin ? (
              <LogIn className="h-8 w-8 text-primary" />
            ) : (
              <UserPlus className="h-8 w-8 text-primary" />
            )}
          </div>
        </div>
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </CardTitle>
        <CardDescription>
          {isLogin 
            ? 'Введите ваши учетные данные для входа' 
            : 'Создайте новую учетную запись'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="firstName"
                      placeholder="Имя"
                      value={formData.firstName}
                      onChange={handleChange}
                      required={!isLogin}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    name="lastName"
                    placeholder="Фамилия"
                    value={formData.lastName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Студент</SelectItem>
                      <SelectItem value="teacher">Преподаватель</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="password"
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Загрузка...
              </div>
            ) : (
              isLogin ? 'Войти в систему' : 'Создать аккаунт'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}