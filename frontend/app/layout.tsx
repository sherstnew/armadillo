import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { TTSProvider } from '@/context/tts-context'
import { ChatProvider } from '@/context/chat-context'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Ассистент КУ - Корпоративный университет',
  description: 'ИИ-ассистент Корпоративного университета Московского транспорта',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full flex flex-col">
          <AuthProvider>
            <TTSProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </TTSProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}