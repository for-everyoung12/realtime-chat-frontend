import { useEffect, useRef } from "react";
import { joinConversation, leaveConversation, startTypingWs, stopTypingWs } from "@/modules/shared/realtime/chat.emitters";

export const useRoomSocket = (conversationId: string) => {
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!conversationId) return;
    console.log("join room", conversationId);

      await joinConversation(conversationId);
    })();

    return () => {
      mounted = false;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (conversationId) leaveConversation(conversationId);
    };
  }, [conversationId]);

  // tiện ích: debounce typing
  const emitTyping = () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (!conversationId) return;
    startTypingWs(conversationId);
    typingTimer.current = setTimeout(() => stopTypingWs(conversationId), 1500);
  };

  return { emitTyping };
};
