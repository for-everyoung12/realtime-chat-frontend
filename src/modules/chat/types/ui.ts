export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface UiFriend {
  id: string;
  name: string;
  avatar?: string;
  status: PresenceStatus;
  lastMessage?: string;
  lastSeen?: string;
  unreadCount?: number;
}

export interface UiChatRoom {
  id: string; // conversationId
  type: "direct" | "group";
  name: string;
  participants: UiFriend[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}


