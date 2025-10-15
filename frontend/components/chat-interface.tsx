"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Send, 
  Bot, 
  User, 
  Play, 
  Pause, 
  Database, 
  Loader2,
  MessageCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { Message } from '@/types/chat'
import { useTTS } from '@/context/tts-context'
import { useChat } from '@/context/chat-context'
import { useAuth } from '@/context/auth-context'

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const { 
    isPlaying, 
    currentPlayingId, 
    loadingAudioId,
    playMessage, 
    pauseMessage, 
    resumeMessage 
  } = useTTS()

  const [isCached, setIsCached] = useState(false)

  const isCurrentMessagePlaying = currentPlayingId === message.id && isPlaying
  const isLoading = loadingAudioId === message.id

  const handlePlayPause = async () => {
    try {
      if (isCurrentMessagePlaying) {
        pauseMessage()
      } else {
        const cached = await checkCache()
        setIsCached(cached)
        
        if (currentPlayingId === message.id && !isPlaying) {
          resumeMessage()
        } else {
          await playMessage(message.id, message.content)
        }
      }
    } catch (error) {
      console.error('TTS error:', error)
      alert('Ошибка воспроизведения аудио')
    }
  }

  const checkCache = async (): Promise<boolean> => {
    return false
  }

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin" />
    } else if (isCurrentMessagePlaying) {
      return <Pause className="h-5 w-5" />
    } else {
      return <Play className="h-5 w-5" />
    }
  }

  const getButtonTooltip = () => {
    if (isLoading) {
      return 'Загрузка аудио...'
    } else if (isCurrentMessagePlaying) {
      return 'Пауза'
    } else {
      return 'Воспроизвести'
    }
  }

  const getButtonStyles = () => {
    if (isLoading) {
      return 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
    } else if (isCurrentMessagePlaying) {
      return 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100 shadow-md'
    } else {
      return 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 shadow-md'
    }
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'error':
        return <div className="h-2 w-2 rounded-full bg-red-500" />
      default:
        return null
    }
  }

  return (
    <div
      className={`flex gap-3 ${
        message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex items-center justify-center h-10 w-10 rounded-full ${
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {message.sender === 'user' ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>
      
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <div className={`flex items-center gap-2 mt-2 text-xs ${
              message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}>
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {getStatusIcon()}
              {isCached && !isLoading && message.sender === 'assistant' && (
                <span className="flex items-center gap-1 text-green-600">
                  <Database className="h-3 w-3" />
                  cached
                </span>
              )}
              {isLoading && message.sender === 'assistant' && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  loading...
                </span>
              )}
            </div>
          </div>
          
          {message.sender === 'assistant' && (
            <div className="flex-shrink-0">
              <Button
                size="lg"
                className={`h-12 w-12 rounded-full transition-all duration-200 border-2 ${getButtonStyles()}`}
                onClick={handlePlayPause}
                disabled={message.content.length === 0 || isLoading}
                title={getButtonTooltip()}
              >
                {getButtonIcon()}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('')
  const { user } = useAuth()
  const { 
    messages, 
    isConnected, 
    isConnecting, 
    error, 
    sendMessage, 
    retryConnection, 
    clearMessages 
  } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !isConnected) return

    try {
      sendMessage(inputMessage)
      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Ошибка отправки сообщения')
    }
  }

  const handleRetryConnection = async () => {
    try {
      await retryConnection()
    } catch (error) {
      console.error('Failed to reconnect:', error)
    }
  }

  const getConnectionStatus = () => {
    if (isConnecting) return { text: 'Подключение...', color: 'text-yellow-500', icon: Loader2 }
    if (isConnected) return { text: 'Подключено', color: 'text-green-500', icon: Wifi }
    return { text: 'Не подключено', color: 'text-red-500', icon: WifiOff }
  }

  const status = getConnectionStatus()
  const StatusIcon = status.icon

  return (
    <Card className="w-full max-w-4xl h-[600px] flex flex-col border shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <MessageCircle className="h-7 w-7 text-primary" />
            <div>
              <div className="font-bold">ИИ-Ассистент</div>
              <div className="text-sm font-normal text-muted-foreground">
                Корпоративный университет Московского транспорта
              </div>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm ${status.color}`}>
              <StatusIcon className="h-4 w-4" />
              <span>{status.text}</span>
            </div>
            
            {!isConnected && !isConnecting && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRetryConnection}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Переподключиться
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearMessages}
              className="flex items-center gap-2"
              title="Очистить историю"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isConnected 
                  ? "Введите ваше сообщение..." 
                  : "Подключитесь к ассистенту..."
              }
              className="flex-1 h-12 text-base border-2 focus:border-primary transition-colors"
              disabled={!isConnected || isConnecting}
            />
            <Button 
              type="submit" 
              size="lg" 
              className="h-12 px-6 bg-primary hover:bg-primary/90 transition-all duration-200"
              disabled={!inputMessage.trim() || !isConnected || isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}