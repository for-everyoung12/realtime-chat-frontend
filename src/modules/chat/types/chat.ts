export type ConversationType = "single" | "group";
export type MemberRole = "admin" | "member";
export type MessageType = "text" | "image" | "file" | "system";

export interface ConversationMember {
  userId: string;         
  role: MemberRole;      
  joinedAt: string;        // ISO string
}

export interface LastMessage {
  messageId: string;       
  senderId: string;      
  content: string;
  createdAt: string;      
}

export interface Conversation {
  id: string;             
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  members: ConversationMember[];
  lastMessage?: LastMessage;
  createdAt: string;      
  updatedAt: string;      
}

export interface Message {
  id: string;                 
  conversationId: string;
  senderId: string;
  type: MessageType;      
  content: string;           
  fileUrl?: string;
  metadata?: { size?: number; mimeType?: string };
  clientMsgId?: string;      
  readBy: string[];           
  createdAt: string;          
  updatedAt: string;         
}

export type Cursor = {
  beforeCreatedAt?: string; 
  beforeId?: string;        
};
