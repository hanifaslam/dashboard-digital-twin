"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import { AnimatePresence, motion } from "framer-motion";
import { Send, User, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot } from "@/hooks/use-chatbot";
import { DashboardService } from "@/service/dashboard-service";

type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "bot" | "system";
};

const CHATBOT_SESSION_KEY = "dashboard-chatbot-session-id";

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-message",
  content: "You've reached first page",
  sender: "system",
};

const QUICK_PROMPTS = [
  "Gedung ini sekarang konsumsi dayanya berapa?",
  "Ada device offline?",
  "Ruangan mana yang paling boros?",
  "Suhu ruangan ini berapa?",
  "Trend daya lagi naik atau turun?",
];

function createSessionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `dashboard-chat-${Date.now()}`;
}

function buildMessageId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `chat-message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function Chatbot() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      window.localStorage.getItem(CHATBOT_SESSION_KEY) || createSessionId()
    );
  });
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const { activeBuildingId, activeRoomId, isHidden, isOpen, setIsOpen } =
    useChatbot();

  useEffect(() => {
    if (sessionId) {
      window.localStorage.setItem(CHATBOT_SESSION_KEY, sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending, messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || isSending) {
      return;
    }

    const stableSessionId = sessionId || createSessionId();

    if (!sessionId) {
      window.localStorage.setItem(CHATBOT_SESSION_KEY, stableSessionId);
      setSessionId(stableSessionId);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: buildMessageId(),
        content: trimmed,
        sender: "user",
      },
    ]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await DashboardService.sendChatbotMessage({
        message: trimmed,
        building_id: activeBuildingId ?? undefined,
        room_id: activeRoomId ?? undefined,
        session_id: stableSessionId,
      });

      if (
        response.data?.session_id &&
        response.data.session_id !== stableSessionId
      ) {
        window.localStorage.setItem(
          CHATBOT_SESSION_KEY,
          response.data.session_id,
        );
        setSessionId(response.data.session_id);
      }

      const reply =
        response.success && response.data?.reply
          ? response.data.reply
          : response.message;

      setMessages((prev) => [
        ...prev,
        {
          id: buildMessageId(),
          content: reply,
          sender: "bot",
        },
      ]);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Chatbot sedang tidak tersedia. Coba lagi sebentar.";

      setMessages((prev) => [
        ...prev,
        {
          id: buildMessageId(),
          content: errorMessage,
          sender: "bot",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();
    await sendMessage(inputValue);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-18 right-4 z-50 flex flex-col items-end gap-4 transition-all duration-300 ${
        isHidden || activeRoomId
          ? "pointer-events-none translate-y-4 opacity-0"
          : "opacity-100"
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-0"
          >
            <div className="tech-card flex w-80 flex-col overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-xl">
              <div className="flex flex-row items-center justify-between border-b border-cyan-500/20 bg-slate-900/50 p-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <div className="space-y-0.5">
                    <span className="block text-sm font-semibold tracking-wide text-white">
                      Digital Twin Assistant
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 p-0">
                <ScrollArea className="h-[380px] p-4">
                  <div className="flex flex-col gap-4">
                    {messages.map((message) =>
                      message.sender === "system" ? (
                        <div
                          key={message.id}
                          className="my-1 text-center text-[10px] text-white"
                        >
                          {message.content}
                        </div>
                      ) : (
                        <div
                          key={message.id}
                          className={`flex max-w-[85%] gap-2 ${
                            message.sender === "user"
                              ? "ml-auto flex-row-reverse"
                              : ""
                          }`}
                        >
                          <Avatar className="h-7 w-7 shrink-0 border border-cyan-500/30">
                            {message.sender === "bot" ? (
                              <>
                                <AvatarImage
                                  src="/logo.png"
                                  alt="Bot Logo"
                                  className="object-contain p-1"
                                />
                                <AvatarFallback className="bg-slate-900 text-cyan-400">
                                  DTA
                                </AvatarFallback>
                              </>
                            ) : (
                              <AvatarFallback className="bg-cyan-950 text-cyan-300">
                                <User className="h-3.5 w-3.5" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div
                            className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                              message.sender === "user"
                                ? "border border-cyan-500/40 bg-cyan-600/20 text-white"
                                : "border border-cyan-500/20 bg-slate-900 text-white/90"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ),
                    )}

                    {isSending && (
                      <div className="flex max-w-[85%] gap-2">
                        <Avatar className="h-7 w-7 shrink-0 border border-cyan-500/30">
                          <AvatarImage
                            src="/logo.png"
                            alt="Logo"
                            className="object-contain p-1"
                          />
                          <AvatarFallback className="bg-slate-900 text-cyan-400">
                            DTA
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex h-[34px] items-center gap-1 rounded-xl border border-cyan-500/20 bg-slate-900 px-4">
                          <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400/80 [animation-delay:-0.3s]"></span>
                          <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400/80 [animation-delay:-0.15s]"></span>
                          <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400/80"></span>
                        </div>
                      </div>
                    )}

                    <div ref={bottomAnchorRef} />
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col border-t border-cyan-500/20 bg-slate-950/80">
                <div className="flex gap-2 overflow-x-auto p-3 pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-[10px] text-white transition-colors hover:bg-cyan-900/60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  <form
                    onSubmit={(event) => void handleSendMessage(event)}
                    className="flex w-full items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Send a message.."
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      className="flex-1 rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2 text-xs text-white placeholder:text-white/35 transition-colors focus:border-cyan-400 focus:outline-none"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500"
                      disabled={!inputValue.trim() || isSending}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-12 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-600 p-0 text-white shadow-lg transition-all duration-300 hover:bg-cyan-500 overflow-hidden ${
            isOpen ? "w-12" : "w-[135px]"
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold tracking-wide">Assistant</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
