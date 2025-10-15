import { Message } from '@/types/chat'

class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: ((message: Message) => void)[] = []
  private connectionHandlers: ((connected: boolean) => void)[] = []
  private errorHandlers: ((error: string) => void)[] = []

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://')
      const url = `${baseUrl}/ai?Authorization=${encodeURIComponent(token)}`

      try {
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
          console.log('🔌 WebSocket connected')
          this.notifyConnectionHandlers(true)
          resolve()
        }

        this.socket.onmessage = (event) => {
          console.log('📨 Received message:', event.data)
          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: event.data,
            sender: 'assistant',
            timestamp: new Date(),
            status: 'sent'
          }
          this.notifyMessageHandlers(assistantMessage)
        }

        this.socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          this.notifyErrorHandlers('Ошибка подключения к ассистенту')
          reject(error)
        }

        this.socket.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.notifyConnectionHandlers(false)
          if (event.code !== 1000) {
            this.notifyErrorHandlers('Соединение с ассистентом прервано')
          }
        }

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Normal closure')
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