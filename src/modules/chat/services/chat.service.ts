import { http } from "../../shared/api/http";
import { API } from "../../shared/api/endpoints";
import { ChatRoom, Message, SendMessagePayload, CreateRoomPayload } from "../types/chat";

export const ChatService = {
  // Lấy danh sách các phòng chat
  getRooms: async (): Promise<ChatRoom[]> => {
    const response = await http.get(API.chat.rooms);
    return response.data;
  },

  // Tạo phòng chat mới
  createRoom: async (payload: CreateRoomPayload): Promise<ChatRoom> => {
    const response = await http.post(API.chat.rooms, payload);
    return response.data;
  },

  // Lấy tin nhắn của một phòng
  getMessages: async (roomId: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = await http.get(API.chat.messages(roomId), {
      params: { page, limit }
    });
    return response.data;
  },

  // Gửi tin nhắn
  sendMessage: async (roomId: string, payload: SendMessagePayload): Promise<Message> => {
    const response = await http.post(API.chat.sendMessage(roomId), payload);
    return response.data;
  },

  // Tham gia phòng chat
  joinRoom: async (roomId: string): Promise<void> => {
    await http.post(API.chat.joinRoom(roomId));
  },

  // Rời khỏi phòng chat
  leaveRoom: async (roomId: string): Promise<void> => {
    await http.post(API.chat.leaveRoom(roomId));
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (roomId: string, messageId: string): Promise<void> => {
    await http.patch(`/chat/rooms/${roomId}/messages/${messageId}/read`);
  },

  // Tìm kiếm tin nhắn
  searchMessages: async (roomId: string, query: string): Promise<Message[]> => {
    const response = await http.get(API.chat.messages(roomId), {
      params: { search: query }
    });
    return response.data;
  }
};