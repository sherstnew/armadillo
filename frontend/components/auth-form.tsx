"use client"

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogIn, UserPlus, Mail, Lock, User, Users, Phone, Calendar, Building } from 'lucide-react'

interface OnboardingStepProps {
  currentStep: number
  totalSteps: number
  title: string
  description: string
  children: React.ReactNode
}

function OnboardingStep({ currentStep, totalSteps, title, description, children }: OnboardingStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      {children}
    </div>
  )
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    gender: 'male' as 'male' | 'female' | 'other',
    age: 18,
    phone: '',
    department: '',
    position: '',
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
      alert(error instanceof Error ? error.message : 'Ошибка авторизации')
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

  const nextStep = () => {
    setOnboardingStep(prev => prev + 1)
  }

  const prevStep = () => {
    setOnboardingStep(prev => prev - 1)
  }

  const onboardingSteps = [
    {
      title: 'Основная информация',
      description: 'Введите ваши основные данные',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="firstName"
                  placeholder="Имя"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
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
                required
              />
            </div>
          </div>
          
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
        </div>
      )
    },
    {
      title: 'Личная информация',
      description: 'Расскажите немного о себе',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Пол</label>
            <Select 
              value={formData.gender} 
              onValueChange={(value: 'male' | 'female' | 'other') => 
                setFormData(prev => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите пол" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Мужской</SelectItem>
                <SelectItem value="female">Женский</SelectItem>
                <SelectItem value="other">Другой</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="age"
                type="number"
                placeholder="Возраст"
                value={formData.age}
                onChange={handleChange}
                min="16"
                max="100"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="phone"
                type="tel"
                placeholder="Телефон (опционально)"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Профессиональная информация',
      description: 'Ваша роль в университете',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Роль</label>
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

          {(formData.role === 'teacher' || formData.role === 'admin') && (
            <>
              <div className="space-y-2">
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="department"
                    placeholder="Кафедра/Отдел"
                    value={formData.department}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  name="position"
                  placeholder="Должность"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
        </div>
      )
    }
  ]

  if (!isLogin && onboardingStep < onboardingSteps.length) {
    return (
      <Card className="w-full max-w-md border shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <OnboardingStep
              currentStep={onboardingStep}
              totalSteps={onboardingSteps.length}
              title={onboardingSteps[onboardingStep].title}
              description={onboardingSteps[onboardingStep].description}
            >
              {onboardingSteps[onboardingStep].content}
              
              <div className="flex gap-2 pt-4">
                {onboardingStep > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    Назад
                  </Button>
                )}
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <Button type="button" onClick={nextStep} className="flex-1">
                    Продолжить
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Регистрация...
                      </div>
                    ) : (
                      'Зарегистрироваться'
                    )}
                  </Button>
                )}
              </div>
            </OnboardingStep>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(true)
                setOnboardingStep(0)
              }}
              className="text-primary hover:underline font-medium"
            >
              Войти
            </button>
          </div>
        </CardContent>
      </Card>
    )
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
                {isLogin ? 'Вход...' : 'Регистрация...'}
              </div>
            ) : (
              isLogin ? 'Войти в систему' : 'Начать регистрацию'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setOnboardingStep(0)
            }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}