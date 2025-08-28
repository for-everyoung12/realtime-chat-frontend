export const API = {
  auth: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  chat: {
    CHAT_CONVERSATION: "/chat/conversations",
    CREATE_CONVERSATION: "/chat/conversations",
    CHAT_MESSAGE: "/chat/messages",
    SEND_MESSAGE: "/chat/messages",
    READ_MESSAGE: (id: string) => `/chat/messages/${id}/read`,
  },

  friend: {
    LIST: "/friend/list"
  }
};