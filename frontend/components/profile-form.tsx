"use client"

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export function ProfileForm() {
  const { user, updateUser, deleteAccount, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'student'
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateUser(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Update error:', error)
      alert('Ошибка при обновлении данных')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'student'
    })
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      await deleteAccount()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении аккаунта')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
          <CardDescription>
            Управление вашими личными данными и настройками аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Имя</label>
              {isEditing ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded-md bg-muted/50">{user.firstName}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Фамилия</label>
              {isEditing ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded-md bg-muted/50">{user.lastName}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            ) : (
              <div className="p-2 border rounded-md bg-muted/50">{user.email}</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Роль</label>
            {isEditing ? (
              <Select 
                value={formData.role} 
                onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Студент</SelectItem>
                  <SelectItem value="teacher">Преподаватель</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 border rounded-md bg-muted/50 capitalize">{user.role}</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Дата регистрации</label>
            <div className="p-2 border rounded-md bg-muted/50">
              {(new Date(user.createdAt)).toLocaleDateString('ru-RU')}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
          <CardDescription>
            Эти действия необратимы. Пожалуйста, будьте осторожны.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Выйти из аккаунта</h4>
              <p className="text-sm text-muted-foreground">
                Выйти из текущей сессии
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              Выйти
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive">Удалить аккаунт</h4>
              <p className="text-sm text-muted-foreground">
                Навсегда удалить ваш аккаунт и все данные
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Удалить аккаунт</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Это навсегда удалит ваш аккаунт
                    и все данные, связанные с ним.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}