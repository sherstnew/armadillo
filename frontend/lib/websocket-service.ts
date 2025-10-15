import { Message } from '@/types/chat'

class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: ((message: Message) => void)[] = []
  private connectionHandlers: ((connected: boolean) => void)[] = []
  private errorHandlers: ((error: string) => void)[] = []
  private connectionPromise: Promise<void> | null = null

  connect(token: string): Promise<void> {
    // Если уже есть активное подключение, возвращаем существующий промис
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      // Закрываем существующее соединение если есть
      if (this.socket) {
        this.socket.close()
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://')
      const url = `${baseUrl}/ai/?Authorization=${encodeURIComponent(token)}`

      console.log('🔌 Connecting to WebSocket...')
      
      try {
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
          console.log('✅ WebSocket connected successfully')
          this.notifyConnectionHandlers(true)
          resolve()
        }

        this.socket.onmessage = (event) => {
          console.log('📨 Received message from assistant')
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
          this.connectionPromise = null
          
          if (event.code !== 1000) {
            this.notifyErrorHandlers('Соединение с ассистентом прервано')
          }
        }

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error)
        this.connectionPromise = null
        reject(error)
      }
    })

    return this.connectionPromise
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...')
    this.connectionPromise = null
    
    if (this.socket) {
      this.socket.close(1000, 'Normal closure')
      this.socket = null
    }
  }

  sendMessage(content: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending message to assistant:', content.substring(0, 50) + '...')
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