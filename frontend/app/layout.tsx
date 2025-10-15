import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { TTSProvider } from '@/context/tts-context'
import { ChatProvider } from '@/context/chat-context'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'ИИ-Ассистент - Московский транспорт',
  description: 'Корпоративный университет Московского транспорта',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <TTSProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </TTSProvider>
        </AuthProvider>
      </body>
    </html>
  )
}