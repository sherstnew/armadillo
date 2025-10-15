"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
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

  // Refs для предотвращения повторных подключений
  const connectionAttempted = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMounted = useRef(true)

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

    // Предотвращаем множественные подключения
    if (chatState.isConnected || chatState.isConnecting || connectionAttempted.current) {
      console.log('🔄 Connection already in progress or established')
      return
    }

    console.log('🔌 Starting WebSocket connection...')
    connectionAttempted.current = true
    setChatState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      await websocketService.connect(token)
      console.log('✅ WebSocket connected successfully')
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
      connectionAttempted.current = false
      setChatState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Не удалось подключиться к ассистенту'
      }))
      throw error
    }
  }, [token, isAuthenticated, chatState.isConnected, chatState.isConnecting])

  const disconnect = useCallback((): void => {
    console.log('🔌 Disconnecting WebSocket...')
    connectionAttempted.current = false
    websocketService.disconnect()
    setChatState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null
    }))

    // Очищаем таймаут переподключения
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
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
    console.log('🔄 Manual reconnection attempt')
    await connect()
  }, [connect])

  // Умное переподключение с экспоненциальной задержкой
  const scheduleReconnect = useCallback(() => {
    if (!isMounted.current || !isAuthenticated) return

    // Очищаем предыдущий таймаут
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    // Увеличиваем задержку с каждой попыткой (max 30 секунд)
    const delay = Math.min(1000 * Math.pow(2, connectionAttempted.current ? 1 : 0), 30000)
    
    console.log(`🔄 Scheduling reconnect in ${delay}ms`)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMounted.current && isAuthenticated && !chatState.isConnected) {
        connect().catch(console.error)
      }
    }, delay)
  }, [isAuthenticated, chatState.isConnected, connect])

  // Подписка на события WebSocket
  useEffect(() => {
    const handleMessage = (message: Message) => {
      addMessage(message)
    }

    const handleConnectionChange = (connected: boolean) => {
      console.log(`🔌 WebSocket connection changed: ${connected}`)
      setChatState(prev => ({
        ...prev,
        isConnected: connected,
        isConnecting: false,
        error: connected ? null : prev.error
      }))

      if (connected) {
        connectionAttempted.current = false
        // Очищаем таймаут переподключения при успешном подключении
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      } else if (isMounted.current && isAuthenticated) {
        // Планируем переподключение только если пользователь аутентифицирован
        connectionAttempted.current = false
        scheduleReconnect()
      }
    }

    const handleError = (error: string) => {
      console.error('❌ WebSocket error:', error)
      setChatState(prev => ({ 
        ...prev, 
        error, 
        isConnecting: false 
      }))
      connectionAttempted.current = false
    }

    websocketService.onMessage(handleMessage)
    websocketService.onConnectionChange(handleConnectionChange)
    websocketService.onError(handleError)

    return () => {
      websocketService.removeMessageHandler(handleMessage)
      websocketService.removeConnectionHandler(handleConnectionChange)
      websocketService.removeErrorHandler(handleError)
    }
  }, [addMessage, isAuthenticated, scheduleReconnect])

  // Управление подключением при изменении аутентификации
  useEffect(() => {
    isMounted.current = true

    if (isAuthenticated && token) {
      console.log('👤 User authenticated, connecting WebSocket...')
      // Небольшая задержка перед первым подключением
      const timeout = setTimeout(() => {
        if (isMounted.current) {
          connect().catch(console.error)
        }
      }, 3000)

      return () => clearTimeout(timeout)
    } else {
      console.log('👤 User not authenticated, disconnecting WebSocket...')
      disconnect()
    }

    return () => {
      isMounted.current = false
      disconnect()
    }
  }, [isAuthenticated, token, connect, disconnect])

  // Приветственное сообщение
  useEffect(() => {
    if (chatState.messages.length === 0 && user && chatState.isConnected) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: getWelcomeMessage(user.role),
        sender: 'assistant',
        timestamp: new Date(),
      }
      addMessage(welcomeMessage)
    }
  }, [user, chatState.messages.length, chatState.isConnected, addMessage])

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