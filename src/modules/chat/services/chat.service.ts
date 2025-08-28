import { API } from "@shared/api/endpoints";
import { http } from "@shared/api/http";
import type { Conversation, Message, Cursor } from "../types/chat";
import { mapConversation, mapMessage } from "../mappers/chat.mapper";

type PageResult<T> = { rows: T[]; nextCursor: string | null };

export const ChatService = {
    getConversations: (params?: { limit?: number; cursor?: string }): Promise<PageResult<Conversation>> =>
        http
            .get<any>(API.chat.CHAT_CONVERSATION, { params })
            .then((res) => {
                const data = res.data;
                const rows = Array.isArray(data) ? data : data?.rows ?? [];
                const nextCursor = Array.isArray(data) ? null : data?.nextCursor ?? null;
                return { rows: rows.map(mapConversation), nextCursor };
            }),

    createConversation: (memberId: string) =>
        http
            .post<any>(API.chat.CREATE_CONVERSATION, { memberId })
            .then((res) => mapConversation(res.data) as Conversation),

    getMessages: (
        conversationId: string,
        params?: { limit?: number; cursor?: Cursor }
    ): Promise<PageResult<Message>> =>
        http
            .get<any>(API.chat.CHAT_MESSAGE, { params: { conversationId, ...params } })
            .then((res) => {
                const data = res.data;
                const rows = Array.isArray(data) ? data : data?.rows ?? [];
                const nextCursor = Array.isArray(data) ? null : data?.nextCursor ?? null;
                return { rows: rows.map(mapMessage), nextCursor };
            }),

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
            .then((res) => res.data),
};
