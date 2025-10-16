"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Message, ChatState } from '@/types/chat'
import { Conversation, ChatMessage as ApiChatMessage } from '@/types/api'
import { websocketService } from '@/lib/websocket-service'
import { useAuth } from '@/context/auth-context'
import { apiService } from '@/lib/api'

interface ChatContextType extends ChatState {
  sendMessage: (content: string) => void
  connect: () => Promise<void>
  disconnect: () => void
  clearMessages: () => void
  clearConversation: () => Promise<void>
  retryConnection: () => Promise<void>
  loadConversation: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth()
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isConnecting: false,
    error: null,
    hasHistory: false,
  })

  // Загрузка истории
  const loadConversation = useCallback(async (): Promise<void> => {
    if (!token) return

    try {
      console.log('📖 Loading conversation history...')
      const conversation = await apiService.getConversation(token)
      
      // Конвертируем сообщения из API в наш формат
      const messages: Message[] = conversation.messages.map((msg: ApiChatMessage, index: number) => ({
        id: `hist_${index}_${Date.now()}`,
        content: msg.content,
        sender: msg.role === 'user' ? 'user' : 'assistant',
        timestamp: new Date(),
        status: 'sent'
      }))

      setChatState(prev => ({
        ...prev,
        messages,
        hasHistory: messages.length > 0
      }))
      
      console.log('✅ Conversation history loaded:', messages.length, 'messages')
    } catch (error: any) {
      console.log('ℹ️ No conversation history found or error loading:', error.message)
      // Если истории нет - это нормально
    }
  }, [token])

  // Очистка истории
  const clearConversation = useCallback(async (): Promise<void> => {
    if (!token) return

    try {
      console.log('🗑️ Clearing conversation history...')
      await apiService.clearConversation(token)
      
      // Оставляем только последнее сообщение (как на бэкенде)
      const lastMessage = chatState.messages[chatState.messages.length - 1]
      const clearedMessages = lastMessage ? [lastMessage] : []
      
      setChatState(prev => ({
        ...prev,
        messages: clearedMessages,
        hasHistory: false
      }))
      
      console.log('✅ Conversation history cleared')
    } catch (error) {
      console.error('❌ Error clearing conversation:', error)
      throw error
    }
  }, [token, chatState.messages])

  const addMessage = useCallback((message: Message) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      error: null,
      hasHistory: true
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
      console.log('🔄 Connection already in progress or established')
      return
    }

    console.log('🔌 Starting WebSocket connection...')
    setChatState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      await websocketService.connect(token)
      console.log('✅ WebSocket connected successfully')
      setChatState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false 
      }))
    } catch (error: any) {
      console.error('❌ WebSocket connection failed:', error)
      
      let errorMessage = 'Не удалось подключиться к ассистенту'
      if (error.message?.includes('401')) {
        errorMessage = 'Ошибка авторизации'
      }
      
      setChatState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: errorMessage
      }))
      throw error
    }
  }, [token, isAuthenticated, chatState.isConnected, chatState.isConnecting])

  const disconnect = useCallback((): void => {
    console.log('🔌 Disconnecting WebSocket...')
    websocketService.disconnect()
    setChatState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }))
  }, [])

  const sendMessage = useCallback((content: string): void => {
    if (!chatState.isConnected) {
      throw new Error('WebSocket is not connected')
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
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
    setChatState(prev => ({ 
      ...prev, 
      messages: [],
      hasHistory: false
    }))
  }, [])

  const retryConnection = useCallback(async (): Promise<void> => {
    console.log('🔄 Manual reconnection attempt')
    await connect()
  }, [connect])

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
      }))
    }

    const handleError = (error: string) => {
      console.error('❌ WebSocket error:', error)
      setChatState(prev => ({ 
        ...prev, 
        error,
        isConnecting: false 
      }))
    }

    websocketService.onMessage(handleMessage)
    websocketService.onConnectionChange(handleConnectionChange)
    websocketService.onError(handleError)

    return () => {
      websocketService.removeMessageHandler(handleMessage)
      websocketService.removeConnectionHandler(handleConnectionChange)
      websocketService.removeErrorHandler(handleError)
      disconnect()
    }
  }, [addMessage, disconnect])

  // Загрузка истории при аутентификации
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('👤 User authenticated, loading conversation...')
      loadConversation()
    } else {
      // При выходе очищаем сообщения
      setChatState({
        messages: [],
        isConnected: false,
        isConnecting: false,
        error: null,
        hasHistory: false,
      })
    }
  }, [isAuthenticated, token, loadConversation])

  // Приветственное сообщение (только если нет истории)
  useEffect(() => {
    if (chatState.messages.length === 0 && user && !chatState.hasHistory) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: getWelcomeMessage(user.role),
        sender: 'assistant',
        timestamp: new Date(),
      }
      addMessage(welcomeMessage)
    }
  }, [user, chatState.messages.length, chatState.hasHistory, addMessage])

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
      clearConversation,
      retryConnection,
      loadConversation,
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