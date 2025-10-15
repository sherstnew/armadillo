import { Conversation } from './api'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  conversationId?: string
}

export interface ChatState {
  messages: Message[]
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  conversations: Conversation[]
  currentConversationId: string | null
}