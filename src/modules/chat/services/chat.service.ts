import { API } from "@shared/api/endpoints";
import { http } from "@shared/api/http";
import type { Conversation, Message, Cursor } from "../types/chat";
import { mapConversation, mapMessage } from "../mappers/chat.mapper";

export const ChatService = {
    getConversations: (params?: { limit?: number; cursor?: Cursor }) =>
        http
            .get<any[]>(API.chat.CHAT_CONVERSATION, { params })
            .then((res) => res.data.map(mapConversation) as Conversation[]),

    createConversation: (memberId: string) =>
        http
            .post<any>(API.chat.CREATE_CONVERSATION, { memberId })
            .then((res) => mapConversation(res.data) as Conversation),

    getMessages: (
        conversationId: string,
        params?: { limit?: number; cursor?: Cursor }
    ) =>
        http
            .get<any[]>(API.chat.CHAT_MESSAGE, {
                params: { conversationId, ...params },
            })
            .then((res) => res.data.map(mapMessage) as Message[]),

    createMessage: (payload: {
        conversationId: string;
        type?: "text" | "image" | "file" | "system";
        content?: string;
        fileUrl?: string;
        metadata?: { size?: number; mimeType?: string };
        clientMsgId?: string;
    }) =>
        http
            .post<any>(API.chat.SEND_MESSAGE, payload)
            .then((res) => mapMessage(res.data) as Message),

    readMessage: (messageId: string) =>
        http
            .patch<{ success: boolean }>(API.chat.READ_MESSAGE(messageId))
            .then(res => res.data),

};
