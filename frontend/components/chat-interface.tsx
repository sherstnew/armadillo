"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  Bot,
  User,
  Play,
  Pause,
  Database,
  Loader2,
  MessageCircle,
  Trash2,
  History,
  X,
  RefreshCw,
} from "lucide-react";
import { Message } from "@/types/chat";
import { useTTS } from "@/context/tts-context";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const {
    isPlaying,
    currentPlayingId,
    loadingAudioId,
    playMessage,
    pauseMessage,
    resumeMessage,
  } = useTTS();

  const [isCached, setIsCached] = useState(false);

  const isCurrentMessagePlaying = currentPlayingId === message.id && isPlaying;
  const isLoading = loadingAudioId === message.id;

  const handlePlayPause = async () => {
    try {
      if (isCurrentMessagePlaying) {
        pauseMessage();
      } else {
        const cached = await checkCache();
        setIsCached(cached);

        if (currentPlayingId === message.id && !isPlaying) {
          resumeMessage();
        } else {
          await playMessage(message.id, message.content);
        }
      }
    } catch (error) {
      console.error("TTS error:", error);
      alert("Ошибка воспроизведения аудио");
    }
  };

  const checkCache = async (): Promise<boolean> => {
    return false;
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    } else if (isCurrentMessagePlaying) {
      return <Pause className="h-4 w-4" />;
    } else {
      return <Play className="h-4 w-4" />;
    }
  };

  const getButtonTooltip = () => {
    if (isLoading) {
      return "Загрузка аудио...";
    } else if (isCurrentMessagePlaying) {
      return "Пауза";
    } else {
      return "Воспроизвести";
    }
  };

  const getButtonStyles = () => {
    if (isLoading) {
      return "bg-primary/50 text-white hover:bg-blue-600";
    } else if (isCurrentMessagePlaying) {
      return "bg-white text-gray-900 hover:bg-gray-100";
    } else {
      return "bg-primary text-white hover:bg-primary/80";
    }
  };

  return (
    <div
      className={`flex gap-3 ${
        message.sender === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0 ${
          message.sender === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {message.sender === "user" ? (
          <User className="h-4 w-4 md:h-5 md:w-5" />
        ) : (
          <Bot className="h-4 w-4 md:h-5 md:w-5" />
        )}
      </div>

      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 md:py-3 ${
          message.sender === "user"
            ? "bg-primary/70 text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div className="flex items-start gap-2 md:gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            <div
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 md:gap-8 mt-2 md:mt-3 text-xs ${
                message.sender === "user"
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {message.sender === "assistant" && (
                <div className="flex-shrink-0">
                  <Button
                    size="sm"
                    className={`h-9 md:h-10 px-2 md:px-3 rounded-full transition-all duration-200 border-2 text-xs md:text-sm ${getButtonStyles()}`}
                    onClick={handlePlayPause}
                    disabled={message.content.length === 0 || isLoading}
                    title={getButtonTooltip()}
                  >
                    {getButtonIcon()}
                    <span className="ml-1 md:ml-2">Прослушать</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();
  const {
    messages,
    isConnected,
    isConnecting,
    error,
    sendMessage,
    clearMessages,
    clearAllHistory,
    conversations,
    loadHistory,
    loadConversation,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;

    try {
      sendMessage(inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Ошибка отправки сообщения");
    }
  };

  const handleClearAllHistory = async () => {
    if (!confirm("Вы уверены, что хотите удалить всю историю сообщений? Это действие нельзя отменить.")) {
      return;
    }

    try {
      await clearAllHistory();
      setShowHistory(false);
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Ошибка при очистке истории");
    }
  };

  const handleRefreshHistory = async () => {
    try {
      await loadHistory();
    } catch (error) {
      console.error("Error refreshing history:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFirstMessageContent = (conversation: any) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "Нет сообщений";
    }
    const firstMessage = conversation.messages[0];
    return firstMessage.content.length > 50 
      ? firstMessage.content.substring(0, 50) + '...' 
      : firstMessage.content;
  };

  return (
    <div className="flex gap-4 w-full max-w-6xl mx-auto px-2 md:px-4">
      {/* Боковая панель истории */}
      {showHistory && (
        <Card className="w-80 flex-shrink-0 h-[90vh] md:h-[80vh] hidden md:block">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                История
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshHistory}
                  title="Обновить историю"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <div className="flex-1 overflow-y-auto h-4/5">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Нет сохраненных бесед
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => {
                        loadConversation(conversation.id);
                        setShowHistory(false);
                      }}
                    >
                      <div className="text-sm font-medium mb-1">
                        Беседа от {formatDate(conversation.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {getFirstMessageContent(conversation)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {conversation.messages?.length || 0} сообщений
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllHistory}
                className="w-full"
                disabled={conversations.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить всю историю
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Основной чат */}
      <Card className="flex-1 h-[90vh] md:h-[80vh] flex flex-col border shadow-lg">
        <CardHeader className="border-b p-3 md:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
              <MessageCircle className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              <div>
                <div className="font-bold text-sm md:text-base">Ассистент КУ</div>
                <div className="text-xs md:text-sm font-normal text-muted-foreground hidden sm:block">
                  Корпоративный университет
                </div>
              </div>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 md:gap-2 h-8 md:h-9"
                title="История сообщений"
              >
                <History className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline text-xs md:text-sm">История</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={clearMessages}
                className="flex items-center gap-1 md:gap-2 h-8 md:h-9"
                title="Очистить текущий чат"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline text-xs md:text-sm">Очистить</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {error && (
              <div className="flex justify-center">
                <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs md:text-sm">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t bg-muted/30">
            <div className="flex gap-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isConnected
                    ? "Введите ваше сообщение..."
                    : "Подключитесь к ассистенту..."
                }
                className="flex-1 h-10 md:h-12 text-sm md:text-base border-2 focus:border-primary transition-colors"
                disabled={!isConnected || isConnecting}
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 w-13 md:h-12 px-3 md:px-6 bg-primary hover:bg-primary/90 transition-all duration-200"
                disabled={!inputMessage.trim() || !isConnected || isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 md:h-5 md:w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 md:h-5 md:w-5" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}