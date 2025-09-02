export const API = {
  auth: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  user: {
    SEARCH: (q: string, cursor?: string, limit: number = 20) => {
      const params = new URLSearchParams({ q, limit: String(limit) })
      if (cursor) params.append("cursor", cursor)
      return `/user/search?${params.toString()}`
    },
    PROFILE: (id: string) => `/user/profile/${id}`,
    
  },

  chat: {
    CHAT_CONVERSATION: "/chat/conversations",
    CREATE_CONVERSATION: "/chat/conversations",
    CHAT_MESSAGE: "/chat/messages",
    SEND_MESSAGE: "/chat/messages",
    READ_MESSAGE: (id: string) => `/chat/messages/${id}/read`,
  },

  friend: {
    LIST: "/friend/list",
    LIST_PENDING: "/friend/pending",
    FRIEND_REQUEST: (id: string) => `/friend/request/${id}`,
    FRIEND_ACCEPT: (id: string) => `/friend/accept/${id}`,
    FRIEND_REJECT: (id: string) => `/friend/reject/${id}`,
    FRIEND_BLOCK: (id: string) => `/friend/block/${id}`,
    FRIEND_UNBLOCK: (id: string) => `/friend/unblock/${id}`,  
  }
};