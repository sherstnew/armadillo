"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Message, ChatState } from '@/types/chat'
import { websocketService } from '@/lib/websocket-service'
import { useAuth } from '@/context/auth-context'

interface ChatContextType extends ChatState {
  sendMessage: (content: string) => void
  connect: () => Promise<void>
  disconnect: () => void
  clearMessages: () => void
  retryConnection: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth()
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isConnecting: false,
    error: null,
  })

  // Восстановление сообщений из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chat_messages')
      if (savedMessages) {
        try {
          const messages = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          setChatState(prev => ({ ...prev, messages }))
        } catch (error) {
          console.error('Error restoring messages:', error)
        }
      }
    }
  }, [])

  // Сохранение сообщений в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && chatState.messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(chatState.messages))
    }
  }, [chatState.messages])

  const addMessage = useCallback((message: Message) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      error: null
    }))
  }, [])

  const updateMessageStatus = useCallback((messageId: string, status: Message['status']) => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    }))
  }, [])

  const connect = useCallback(async (): Promise<void> => {
    if (!token || !isAuthenticated) {
      throw new Error('User not authenticated')
    }

    if (chatState.isConnected || chatState.isConnecting) {
      return
    }

    setChatState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      await websocketService.connect(token)
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Не удалось подключиться к ассистенту'
      }))
      throw error
    }
  }, [token, isAuthenticated, chatState.isConnected, chatState.isConnecting])

  const disconnect = useCallback((): void => {
    websocketService.disconnect()
    setChatState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null
    }))
  }, [])

  const sendMessage = useCallback((content: string): void => {
    if (!chatState.isConnected) {
      throw new Error('WebSocket is not connected')
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    }

    addMessage(userMessage)

    try {
      websocketService.sendMessage(content)
      updateMessageStatus(userMessage.id, 'sent')
    } catch (error) {
      console.error('Error sending message:', error)
      updateMessageStatus(userMessage.id, 'error')
      setChatState(prev => ({ ...prev, error: 'Ошибка отправки сообщения' }))
    }
  }, [chatState.isConnected, addMessage, updateMessageStatus])

  const clearMessages = useCallback((): void => {
    setChatState(prev => ({ ...prev, messages: [] }))
    localStorage.removeItem('chat_messages')
  }, [])

  const retryConnection = useCallback(async (): Promise<void> => {
    await connect()
  }, [connect])

  // Подписка на события WebSocket
  useEffect(() => {
    const handleMessage = (message: Message) => {
      addMessage(message)
    }

    const handleConnectionChange = (connected: boolean) => {
      setChatState(prev => ({
        ...prev,
        isConnected: connected,
        isConnecting: false,
        error: connected ? null : prev.error
      }))
    }

    const handleError = (error: string) => {
      setChatState(prev => ({ ...prev, error, isConnecting: false }))
    }

    websocketService.onMessage(handleMessage)
    websocketService.onConnectionChange(handleConnectionChange)
    websocketService.onError(handleError)

    return () => {
      websocketService.removeMessageHandler(handleMessage)
      websocketService.removeConnectionHandler(handleConnectionChange)
      websocketService.removeErrorHandler(handleError)
    }
  }, [addMessage])

  // Автоподключение при аутентификации
  useEffect(() => {
    if (isAuthenticated && token) {
      connect().catch(console.error)
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, token, connect, disconnect])

  // Приветственное сообщение
  useEffect(() => {
    if (chatState.messages.length === 0 && user) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: getWelcomeMessage(user.role),
        sender: 'assistant',
        timestamp: new Date(),
      }
      addMessage(welcomeMessage)
    }
  }, [user, chatState.messages.length, addMessage])

  const getWelcomeMessage = (role: string): string => {
    const messages = {
      student: "Привет! Я твой ИИ-ассистент для обучения. Готов помочь с учебными вопросами, материалами и всем, что связано с твоим образованием!",
      teacher: "Здравствуйте! Я ваш ИИ-ассистент для преподавателей. Помогу с подготовкой материалов, методическими вопросами и организацией учебного процесса.",
      management: "Добро пожаловать! Я ваш ИИ-ассистент для управленческих задач. Готов помочь с аналитикой, отчетностью и организационными вопросами.",
      retraining: "Приветствую! Я ваш ИИ-ассистент для переподготовки. Помогу с учебными материалами, практическими заданиями и карьерным развитием."
    }
    return messages[role as keyof typeof messages] || "Привет! Я ваш ИИ-ассистент. Чем могу помочь?"
  }

  return (
    <ChatContext.Provider value={{
      ...chatState,
      sendMessage,
      connect,
      disconnect,
      clearMessages,
      retryConnection,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}