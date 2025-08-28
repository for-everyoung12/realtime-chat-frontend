import { useEffect } from "react";
import { socket, connectSocket } from "@shared/realtime/socket";
import { EVENTS } from "@shared/realtime/events";
import type { Conversation, Message } from "../types/chat";


export type UseChatSocketOpts = {
  conversations: Conversation[];
  onNewMessage?: (m: Message) => void;
  onMessageReadBy?: (p: { messageId: string; userId: string; readBy: string[]; conversationId: string }) => void;
  onTyping?: (p: { conversationId: string; userId: string; isTyping: boolean }) => void;

  onPresenceSnapshot?: (list: Array<{ userId: string; status: "online" | "away" | "busy" | "offline"; lastOnline?: string }>) => void;
  onPresenceUpdate?: (p: { userId: string; status: "online" | "away" | "busy" | "offline"; lastOnline?: string }) => void;
  requestPresenceSnapshot?: boolean;
};

export const useChatSocket = ({
  conversations,
  onNewMessage,
  onMessageReadBy,
  onTyping,
  onPresenceSnapshot,
  onPresenceUpdate,
  requestPresenceSnapshot = false,
}: UseChatSocketOpts) => {
  useEffect(() => {
    connectSocket();

    if (onNewMessage) socket.on(EVENTS.CHAT.NEW, onNewMessage);
    if (onMessageReadBy) socket.on(EVENTS.CHAT.READ_BY, onMessageReadBy);
    if (onTyping) socket.on(EVENTS.CHAT.TYPING, onTyping);

    if (onPresenceSnapshot) socket.on(EVENTS.PRESENCE.SNAPSHOT, onPresenceSnapshot);
    if (onPresenceUpdate) socket.on(EVENTS.PRESENCE.UPDATE, onPresenceUpdate);

    if (requestPresenceSnapshot && conversations.length > 0) {
      const memberIds = Array.from(new Set(conversations.flatMap(c => c.members.map(m => m.userId))));
      if (memberIds.length) {
        socket.emit(EVENTS.PRESENCE.WHO, { userIds: memberIds });
        socket.emit(EVENTS.PRESENCE.SUBSCRIBE);
      }
    }

    return () => {
      if (onNewMessage) socket.off(EVENTS.CHAT.NEW, onNewMessage);
      if (onMessageReadBy) socket.off(EVENTS.CHAT.READ_BY, onMessageReadBy);
      if (onTyping) socket.off(EVENTS.CHAT.TYPING, onTyping);

      if (onPresenceSnapshot) socket.off(EVENTS.PRESENCE.SNAPSHOT, onPresenceSnapshot);
      if (onPresenceUpdate) socket.off(EVENTS.PRESENCE.UPDATE, onPresenceUpdate);

      if (requestPresenceSnapshot) {
        socket.emit(EVENTS.PRESENCE.UNSUBSCRIBE);
      }
    };
  }, [conversations.length]); 
};
