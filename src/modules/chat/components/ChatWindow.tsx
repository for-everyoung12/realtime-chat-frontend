import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, MoreVertical, Check, CheckCheck } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { Input } from "@/modules/shared/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/avatar";
import { ScrollArea } from "@/modules/shared/components/scroll-area";
import { ChatService } from "@/modules/chat/services/chat.service";
import type { Message as ApiMessage } from "@/modules/chat/types/chat";
import { useAuth } from "@/app/context/AuthContext";
import { registerChatHandlers, unregisterChatHandlers } from "@/modules/shared/realtime/chat.handlers";
import { useRoomSocket } from "@/modules/chat/hooks/useRoomSocket";
import { sendMessageWs } from "@/modules/shared/realtime/chat.emitters";

interface ChatWindowProps {
  chatId: string | null;
  peer?: { id: string; name: string; avatar?: string };
}

import { getInitialLetter } from "@/modules/shared/lib/utils";

type UiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
  isOwn: boolean;
};

export function ChatWindow({ chatId, peer }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { emitTyping } = useRoomSocket(chatId || "");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load messages when chatId changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!chatId) {
        setMessages([]);
        return;
      }
      try {
        const page = await ChatService.getMessages(chatId, { limit: 50 });
        if (cancelled) return;
        setMessages(
          page.rows.map((m: ApiMessage) => ({
            id: m.id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
            status: m.readBy && m.readBy.length > 0 ? "read" : "delivered",
            isOwn: user ? m.senderId === user.id : false,
          }))
        );
      } catch (_) {
        setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chatId, user?.id]);

  // Register realtime handlers for incoming messages
  useEffect(() => {
    const onNewMessage = (m: ApiMessage) => {
      if (!chatId || m.conversationId !== chatId) return;
      setMessages(prev => {
        if (prev.some(x => x.id === m.id || (m.clientMsgId && x.id === m.clientMsgId))) return prev;
        return [
          ...prev,
          {
            id: m.id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
            status: m.readBy && m.readBy.length > 0 ? "read" : "delivered",
            isOwn: user ? m.senderId === user.id : false,
          },
        ];
      });
    };

    registerChatHandlers({ onNewMessage });
    return () => {
      unregisterChatHandlers();
    };
  }, [chatId, user?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || !user) return;

    const clientMsgId = `client-${Date.now()}`;
    const optimistic: UiMessage = {
      id: clientMsgId,
      conversationId: chatId,
      senderId: user.id,
      content: message.trim(),
      createdAt: new Date().toISOString(),
      status: "sent",
      isOwn: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setMessage("");

    try {
      const ack = await sendMessageWs({
        conversationId: chatId,
        type: "text",
        content: optimistic.content,
        clientMsgId,
      });
      if (ack?.ok && ack.id) {
        // Reconcile by ack id; final content will also arrive via onNewMessage
        setMessages(prev => prev.map(m => (m.id === clientMsgId ? { ...m, id: ack.id, status: "delivered" } : m)));
      }
    } catch (_) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== clientMsgId));
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessageStatus = (status: UiMessage['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const showDate = index === 0 ||
              formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

            const showAvatar = !msg.isOwn && (
              index === messages.length - 1 ||
              messages[index + 1].senderId !== msg.senderId ||
              messages[index + 1].isOwn
            );

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-6">
                    <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex gap-3 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!msg.isOwn && (
                    <div className="w-8">
                      {showAvatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitialLetter(peer?.name)} 
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${msg.isOwn ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${msg.isOwn
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-foreground'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>

                    <div className={`flex items-center gap-2 mt-1 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.isOwn && renderMessageStatus(msg.status)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); emitTyping(); }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-transparent"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}