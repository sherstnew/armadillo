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
  MoveDown,
  ArrowDown,
} from "lucide-react";
import { Message } from "@/types/chat";
import { useTTS } from "@/context/tts-context";
import { toast } from "@/lib/toaster";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { roles } from "@/lib/data/roles";
import SpeakingBubble from "./speaking-bubble";
import { ttsCache } from "@/lib/tts-cache";

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const {
    isPlaying,
    currentPlayingId,
    loadingAudioId,
    progress,
    playMessage,
    pauseMessage,
    resumeMessage,
  } = useTTS();

  const [isCached, setIsCached] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const isCurrentMessagePlaying = currentPlayingId === message.id && isPlaying;
  const isLoading = loadingAudioId === message.id;

  const handlePlayPause = async () => {
    try {
      if (isCurrentMessagePlaying) {
        pauseMessage();
      } else {
        const cached = await checkCache();
        setIsCached(cached);
        // show bubble when user triggers playback
        setShowBubble(true);
        // scroll to the bubble (after it renders)
        setTimeout(() => {
          try {
            bubbleRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } catch (e) {
            /* ignore */
          }
        }, 80);

        if (currentPlayingId === message.id && !isPlaying) {
          resumeMessage();
        } else {
          await playMessage(message.id, message.content);
        }
      }
    } catch (error) {
      console.error("TTS error:", error);
      toast.error("Ошибка воспроизведения аудио");
    }
  };

  // hide bubble when playback ended or another message started
  useEffect(() => {
    // if (!isPlaying && currentPlayingId !== message.id) {
    //   // if nothing playing or other message playing, hide
    //   // hide only if not cached
    //   // keep visible if cached
    //   const cached = isCached;
    //   console.log("isCached", isCached);
    //   if (!cached) setShowBubble(false);
    // }

    if (
      currentPlayingId === message.id &&
      (isPlaying || loadingAudioId === message.id)
    ) {
      setShowBubble(true);
    }
  }, [isPlaying, currentPlayingId, loadingAudioId, message.id]);

  // on mount check cache for this message text and keep bubble if cached
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await ttsCache.getCachedAudio(message.content);
        if (mounted && cached) {
          setIsCached(true);
          setShowBubble(true);
        }
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [message.content]);

  const checkCache = async (): Promise<boolean> => {
    try {
      // Попытка использовать ttsService cache через контекст
      // Временно возвращаем false, так как useTTS не предоставляет прямой getCachedAudio
      return false;
    } catch (e) {
      return false;
    }
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
    <>
      <div
        className={`flex gap-3 flex-wrap ${
          message.sender === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex gap-3">
          {message.sender === "user" ? (
            <div
              className={`flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <User className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          ) : (
            <img
              src={
                (
                  roles[(user?.role as keyof typeof roles) ?? "student"]
                    ?.avatar || roles.student.avatar
                ).src
              }
              className="h-12 w-12"
              alt="Аватарка бота"
            />
          )}

          <div
            className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 md:py-3 ${
              message.sender === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <div className="flex items-start gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div
                  className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-8 mt-2 md:mt-3 text-xs ${
                    message.sender === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.sender === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {message.sender === "assistant" && (
          <div className="mt-3 ml-15 w-full">
            {showBubble && (
              <div ref={bubbleRef} className="flex items-center">
                <SpeakingBubble
                  roleKey={(user?.role as keyof typeof roles) ?? "student"}
                  isPlaying={isCurrentMessagePlaying}
                  isLoading={isLoading}
                  progress={currentPlayingId === message.id ? progress : 0}
                  isPaused={currentPlayingId === message.id && !isPlaying}
                  size={200}
                  onToggle={async () => {
                    // Если уже играет данное сообщение — пауза
                    if (currentPlayingId === message.id && isPlaying) {
                      pauseMessage();
                      return;
                    }

                    // Если другое сообщение играет, остановим и запустим это
                    if (currentPlayingId && currentPlayingId !== message.id) {
                      // playMessage will cleanup and play
                      await playMessage(message.id, message.content);
                      return;
                    }

                    // Если это сообщение не играет, запустим (resume если есть audioRef)
                    if (currentPlayingId === message.id && !isPlaying) {
                      resumeMessage();
                      return;
                    }

                    // В остальных случаях — старт воспроизведения
                    await playMessage(message.id, message.content);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useAuth();
  const {
    messages,
    isConnected,
    isConnecting,
    error,
    sendMessage,
    clearMessages,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (immediate = false, bottom = false) => {
    const doScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      try {
        if (immediate) el.scrollTo({ top: el.scrollHeight });
        else el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch (e) {
        el.scrollTop = el.scrollHeight;
      }
    };

    setTimeout(doScroll, 60);
  };

  // Try scrolling multiple times until container height stabilizes (helps when images/videos change layout)
  const ensureScrollToBottom = (maxAttempts = 8, delay = 120) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let attempts = 0;
    let lastHeight = -1;

    const tick = () => {
      const h = el.scrollHeight;
      try {
        el.scrollTo({ top: h, behavior: "smooth" });
      } catch (e) {
        el.scrollTop = h;
      }

      attempts++;
      if (h !== lastHeight && attempts < maxAttempts) {
        lastHeight = h;
        setTimeout(tick, delay);
      }
    };

    tick();
  };

  useEffect(() => {
    ensureScrollToBottom();
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => ensureScrollToBottom(), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;

    try {
      sendMessage(inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Ошибка отправки сообщения");
    }
  };

  return (
    <Card className="w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col border shadow-lg mx-2 md:mx-auto">
      <CardHeader className="border-b p-3 md:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
            <MessageCircle className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            <div>
              <div className="font-bold text-sm md:text-base">Метроша</div>
              <div className="text-xs md:text-sm font-normal text-muted-foreground hidden sm:block">
                Корпоративный университет
              </div>
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearMessages}
              className="flex items-center gap-1 md:gap-2 h-8 md:h-9"
              title="Очистить историю"
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline text-xs md:text-sm">
                Очистить
              </span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => ensureScrollToBottom()}
              className="flex items-center gap-1 md:gap-2 h-8 md:h-9"
              title="Прокрутить вниз"
            >
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <span className="hidden sm:inline text-xs md:text-sm">Вниз</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col h-4/5">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs md:text-sm">
                {error}
              </div>
            </div>
          )} */}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-3 md:p-4 border-t bg-muted/30"
        >
          <div className="flex gap-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isConnected
                  ? "Введите ваше сообщение..."
                  : "Вызываем метрошу..."
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
  );
}
