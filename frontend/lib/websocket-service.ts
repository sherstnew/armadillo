import { Message } from '@/types/chat'

class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: ((message: Message) => void)[] = []
  private connectionHandlers: ((connected: boolean) => void)[] = []
  private errorHandlers: ((error: string) => void)[] = []

  async connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      // Закрываем существующее соединение
      if (this.socket) {
        this.socket.close()
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) {
        reject(new Error('API base URL not configured'))
        return
      }

      // Создаем WebSocket URL
      const wsUrl = baseUrl.replace(/^https?:\/\//, 'wss://') + '/ai'
      const url = `${wsUrl}?Authorization=${encodeURIComponent(token)}`

      console.log('🔌 Connecting to WebSocket...')

      try {
        this.socket = new WebSocket(url)

        const connectionTimeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'))
          }
        }, 500)

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log('✅ WebSocket connected successfully')
          this.notifyConnectionHandlers(true)
          resolve()
        }

        this.socket.onmessage = (event) => {
          console.log('📨 Received message from assistant')
          const assistantMessage: Message = {
            id: `ai_${Date.now()}`,
            content: event.data,
            sender: 'assistant',
            timestamp: new Date(),
            status: 'sent'
          }
          this.notifyMessageHandlers(assistantMessage)
        }

        this.socket.onerror = (event) => {
          clearTimeout(connectionTimeout)
          console.error('❌ WebSocket error')
          reject(new Error('WebSocket connection error'))
        }

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log('🔌 WebSocket disconnected')
          this.notifyConnectionHandlers(false)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  sendMessage(content: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(content)
    } else {
      throw new Error('WebSocket is not connected')
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  // Подписка на события
  onMessage(handler: (message: Message) => void): void {
    this.messageHandlers.push(handler)
  }

  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler)
  }

  onError(handler: (error: string) => void): void {
    this.errorHandlers.push(handler)
  }

  // Уведомление подписчиков
  private notifyMessageHandlers(message: Message): void {
    this.messageHandlers.forEach(handler => handler(message))
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected))
  }

  private notifyErrorHandlers(error: string): void {
    this.errorHandlers.forEach(handler => handler(error))
  }

  // Отписка
  removeMessageHandler(handler: (message: Message) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
  }

  removeConnectionHandler(handler: (connected: boolean) => void): void {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler)
  }

  removeErrorHandler(handler: (error: string) => void): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler)
  }
}

export const websocketService = new WebSocketService()