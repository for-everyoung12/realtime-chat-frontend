import type { Conversation, Message } from "../types/chat";

const toISO = (d: any) => (d ? new Date(d).toISOString() : undefined);

export const mapConversation = (c: any): Conversation => ({
  id: c.id ?? c._id,
  type: c.type,
  name: c.name,
  avatarUrl: c.avatarUrl,
  members: (c.members ?? []).map((m: any) => ({
    userId: m?.userId?._id ?? m?.userId,
    role: m?.role, // may be undefined -> OK if type is optional
    joinedAt: toISO(m?.joinedAt ?? c?.createdAt ?? c?.updatedAt), // fallback an toàn
  })),
  lastMessage:
    c.lastMessage && c.lastMessage.messageId
      ? {
          messageId: c.lastMessage.messageId?._id ?? c.lastMessage.messageId,
          senderId: c.lastMessage.senderId?._id ?? c.lastMessage.senderId,
          content: c.lastMessage.content,
          createdAt: toISO(c.lastMessage.createdAt),
        }
      : undefined,
  createdAt: toISO(c.createdAt) ?? new Date(0).toISOString(),
  updatedAt: toISO(c.updatedAt) ?? new Date(0).toISOString(),
});

export const mapMessage = (m: any): Message => ({
  id: m.id ?? m._id,
  conversationId: m.conversationId?._id ?? m.conversationId,
  senderId: m.senderId?._id ?? m.senderId,
  type: m.type,
  content: m.content ?? "",
  fileUrl: m.fileUrl,
  metadata: m.metadata,
  clientMsgId: m.clientMsgId,
  readBy: (m.readBy ?? []).map((u: any) => u?._id ?? u),
  createdAt: toISO(m.createdAt)!,
  updatedAt: toISO(m.updatedAt)!,
});
