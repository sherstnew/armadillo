"use client"

import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { MessageCircle, User, LogOut, Train } from 'lucide-react'

export function Navigation() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Train className="h-7 w-7 text-primary" />
            <div>
              <div className="text-lg font-bold">МТУ ИИ-Ассистент</div>
              <div className="text-xs text-muted-foreground">Московский транспорт</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Чат
            </Link>
            <Link 
              href="/profile" 
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <User className="h-4 w-4" />
              Профиль
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user.first_name} {user.last_name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}