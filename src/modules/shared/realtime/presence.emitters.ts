import { socket } from "@/modules/shared/realtime/socket";
import { EVENTS } from "@/modules/shared/realtime/events";

export const presenceWho = (userIds: string[]) =>
  new Promise<{ ok: boolean; statuses?: Record<string, string> }>((resolve) => {
    socket.emit(EVENTS.PRESENCE.WHO, { userIds }, (ack: any) => resolve(ack));
  });

export const presenceSubscribe = (userIds: string[]) => {
  socket.emit(EVENTS.PRESENCE.SUBSCRIBE, { userIds });
};

export const presenceUnsubscribe = (userIds: string[]) => {
  socket.emit(EVENTS.PRESENCE.UNSUBSCRIBE, { userIds });
};


