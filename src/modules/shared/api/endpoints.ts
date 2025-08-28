export const API = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  chat: {
    rooms: "/chat/rooms",
    messages: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    sendMessage: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    joinRoom: (roomId: string) => `/chat/rooms/${roomId}/join`,
    leaveRoom: (roomId: string) => `/chat/rooms/${roomId}/leave`,
  },
  users: {
    search: "/users/search",
    profile: (userId: string) => `/users/${userId}`,
  },
};