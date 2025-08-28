import { socket } from "@shared/realtime/socket";
import { EVENTS } from "@shared/realtime/events";


export const joinConversation = (conversationId: string) =>
    new Promise<{ ok: boolean; error?: string }>((resolve) => {
      socket.emit(EVENTS.CHAT.JOIN, { conversationId }, (ack: any) => resolve(ack));
    });

    export const leaveConversation = (conversationId: string) => {
        socket.emit(EVENTS.CHAT.LEAVE, { conversationId });
      };
      
      export const sendMessageWs = (payload: {
        conversationId: string;
        type?: "text" | "image" | "file" | "system";
        content?: string;
        fileUrl?: string;
        metadata?: { size?: number; mimeType?: string };
        clientMsgId?: string;
      }) =>
        new Promise<{ ok: boolean; id?: string; error?: string }>((resolve) => {
          socket.emit(EVENTS.CHAT.SEND, payload, (ack: any) => resolve(ack));
        });
      
      export const readMessageWs = (messageId: string) =>
        new Promise<{ ok: boolean; error?: string }>((resolve) => {
          socket.emit(EVENTS.CHAT.READ, { messageId }, (ack: any) => resolve(ack));
        });
      
      export const startTypingWs = (conversationId: string) =>
        socket.emit(EVENTS.CHAT.TYPING_START, { conversationId });
      
      export const stopTypingWs = (conversationId: string) =>
        socket.emit(EVENTS.CHAT.TYPING_STOP, { conversationId });