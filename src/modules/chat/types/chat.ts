export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessagePayload {
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface CreateRoomPayload {
  name?: string;
  type: 'direct' | 'group';
  participantIds: string[];
}

export interface ChatState {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Socket Events
export interface SocketEvents {
  // Outgoing events
  'join-room': { roomId: string };
  'leave-room': { roomId: string };
  'send-message': { roomId: string; message: SendMessagePayload };
  'typing-start': { roomId: string };
  'typing-stop': { roomId: string };
  
  // Incoming events
  'message-received': { message: Message };
  'user-joined': { user: User; roomId: string };
  'user-left': { userId: string; roomId: string };
  'user-typing': { userId: string; roomId: string; isTyping: boolean };
  'room-updated': { room: ChatRoom };
}