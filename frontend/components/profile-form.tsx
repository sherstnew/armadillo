"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Mail, Phone, Calendar, Building, Briefcase } from "lucide-react";
import { UpdateUserData } from '@/types/user';

export function ProfileForm() {
  const { user, updateUser, deleteAccount, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    role: user?.role || "student",
    gender: user?.gender || "male",
    age: user?.age || 18,
    phone: user?.phone || "",
    department: user?.department || "",
    position: user?.position || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUser(formData as UpdateUserData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      alert("Ошибка при обновлении данных");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      role: user?.role || "student",
      gender: user?.gender || "male",
      age: user?.age || 18,
      phone: user?.phone || "",
      department: user?.department || "",
      position: user?.position || "",
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Ошибка при удалении аккаунта");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профиль пользователя
          </CardTitle>
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
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="p-2 border rounded-md bg-muted/50">
                  {user.first_name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Фамилия</label>
              {isEditing ? (
                <Input
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="p-2 border rounded-md bg-muted/50">
                  {user.last_name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            {isEditing ? (
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            ) : (
              <div className="p-2 border rounded-md bg-muted/50 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Пол</label>
              {isEditing ? (
                <Select
                  value={formData.gender}
                  onValueChange={(value: "male" | "female" | "other") =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                    <SelectItem value="other">Другой</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded-md bg-muted/50 capitalize">
                  {user.gender === "male"
                    ? "Мужской"
                    : user.gender === "female"
                    ? "Женский"
                    : "Другой"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Возраст</label>
              {isEditing ? (
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value) || 18,
                      }))
                    }
                    min="16"
                    max="100"
                    className="pl-10"
                  />
                </div>
              ) : (
                <div className="p-2 border rounded-md bg-muted/50 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {user.age} лет
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Телефон</label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            ) : (
              <div className="p-2 border rounded-md bg-muted/50 flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.phone || "Не указан"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Роль</label>
            {isEditing ? (
              <Select
                value={formData.role}
                onValueChange={(value: "student" | "teacher" | "admin") =>
                  setFormData((prev) => ({ ...prev, role: value }))
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
              <div className="p-2 border rounded-md bg-muted/50 capitalize flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                {user.role === "student"
                  ? "Студент"
                  : user.role === "teacher"
                  ? "Преподаватель"
                  : "Администратор"}
              </div>
            )}
          </div>

          {(user.role === "teacher" || user.role === "admin") && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Кафедра/Отдел</label>
                {isEditing ? (
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.department}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <div className="p-2 border rounded-md bg-muted/50 flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {user.department || "Не указано"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Должность</label>
                {isEditing ? (
                  <Input
                    value={formData.position}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/50">
                    {user.position || "Не указана"}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Дата регистрации</label>
            <div className="p-2 border rounded-md bg-muted/50">
              {user.createdAt.toLocaleDateString("ru-RU")}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Редактировать</Button>
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
                    Это действие нельзя отменить. Это навсегда удалит ваш
                    аккаунт и все данные, связанные с ним.
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
  );
}
