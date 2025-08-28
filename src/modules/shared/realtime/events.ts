export const EVENTS = {
    CHAT: {
      JOIN: "join",
      LEAVE: "leave",
      NEW: "msg:new",
      SEND: "msg:send",
      READ: "message:read",
      READ_BY: "message:readBy",
      TYPING_START: "typing:start",
      TYPING_STOP: "typing:stop",
      TYPING: "typing",
    },
    PRESENCE: {
      SNAPSHOT: "presence:snapshot",
      UPDATE: "presence:update",
      WHO: "presence:who",
      SUBSCRIBE: "presence:subscribe",
      UNSUBSCRIBE: "presence:unsubscribe",
    },
  } as const;
  