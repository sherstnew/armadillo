"use client"

import { useAuth } from '@/context/auth-context'
import { Navigation } from '@/components/navigation'
import { ProfileForm } from '@/components/profile-form'
import { redirect } from 'next/navigation'

export default function ProfilePage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <ProfileForm />
        </div>
      </main>
    </div>
  )
}