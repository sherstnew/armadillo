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
  MessageCircle
} from 'lucide-react'
import { Message } from '@/types/chat'
import { useTTS } from '@/context/tts-context'

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
        // Проверяем кеш перед воспроизведением
        const cached = await checkCache()
        setIsCached(cached)
        
        if (currentPlayingId === message.id && !isPlaying) {
          // Возобновляем воспроизведение
          resumeMessage()
        } else {
          // Начинаем новое воспроизведение
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
      // Пауза - белый фон, черная иконка
      return 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100 shadow-md'
    } else {
      // Воспроизведение - черный фон, белая иконка
      return 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 shadow-md'
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
            <p className="text-sm leading-relaxed">{message.content}</p>
            <div className={`flex items-center gap-2 mt-2 text-xs ${
              message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}>
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {/* {isCached && !isLoading && (
                <span className="flex items-center gap-1 text-green-600">
                  <Database className="h-3 w-3" />
                  cached
                </span>
              )} */}
              {/* {isLoading && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  loading...
                </span>
              )} */}
            </div>
          </div>
          
          {message.sender === 'assistant' && (
            <div className="flex-shrink-0">
              <Button
                size="lg"
                className={`h-9 w-9 mt-10 rounded-full transition-all duration-200 border-2 ${getButtonStyles()}`}
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Я ваш ИИ-ассистент Московского транспорта. Чем могу помочь?',
      sender: 'assistant',
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Mock ответ от ИИ
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Это mock-ответ на ваше сообщение: "${inputMessage}". В будущем здесь будет интеграция с реальным ИИ. Сейчас вы можете нажать на кнопку воспроизведения, чтобы прослушать это сообщение.`,
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="w-full max-w-4xl flex flex-col border shadow-lg h-[80vh]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <MessageCircle className="h-7 w-7 text-primary" />
          <div>
            <div className="font-bold">ИИ-Ассистент</div>
            <div className="text-sm font-normal text-muted-foreground">
              Корпоративный университет Московского транспорта
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col h-4/5">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">ИИ думает...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 pb-0 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Введите ваше сообщение..."
              className="flex-1 h-12 text-base border-2 focus:border-primary transition-colors placeholder:text-primary/60"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg" 
              className="h-12 px-6 bg-primary hover:bg-primary/90 transition-all duration-200"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}