"use client"

import { useAuth } from '@/context/auth-context'
import { AuthForm } from '@/components/auth-form'
import { ChatInterface } from '@/components/chat-interface'
import { Navigation } from '@/components/navigation'

export default function Home() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8">
        <div className="flex justify-center">
          <ChatInterface />
        </div>
      </main>
    </div>
  )
}