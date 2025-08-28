import { socket } from "@shared/realtime/socket";
import { EVENTS } from "@shared/realtime/events";
import type { Message } from "@/modules/chat/types/chat";

type OnNewMessage = (msg: Message) => void;
type OnMessageReadBy = (p: { messageId: string; userId: string; readBy: string[]; conversationId: string }) => void;
type OnTyping = (p: { conversationId: string; userId: string; isTyping: boolean }) => void;

export const registerChatHandlers = (handlers: {
  onNewMessage?: OnNewMessage;
  onMessageReadBy?: OnMessageReadBy;
  onTyping?: OnTyping;
}) => {
  if (handlers.onNewMessage) socket.on(EVENTS.CHAT.NEW, handlers.onNewMessage);
  if (handlers.onMessageReadBy) socket.on(EVENTS.CHAT.READ_BY, handlers.onMessageReadBy);
  if (handlers.onTyping) socket.on(EVENTS.CHAT.TYPING, handlers.onTyping);
};

export const unregisterChatHandlers = () => {
  socket.off(EVENTS.CHAT.NEW);
  socket.off(EVENTS.CHAT.READ_BY);
  socket.off(EVENTS.CHAT.TYPING);
};
