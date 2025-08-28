import { useEffect } from "react";
import { socket } from "@shared/realtime/socket";
import { EVENTS } from "@shared/realtime/events";

export const usePresence = (onSnapshot: Function, onUpdate: Function) => {
  useEffect(() => {
    const s1 = (list: any) => onSnapshot(list);
    const s2 = (p: any) => onUpdate(p);
    socket.on(EVENTS.PRESENCE.SNAPSHOT, s1);
    socket.on(EVENTS.PRESENCE.UPDATE, s2);
    return () => {
      socket.off(EVENTS.PRESENCE.SNAPSHOT, s1);
      socket.off(EVENTS.PRESENCE.UPDATE, s2);
    };
  }, [onSnapshot, onUpdate]);
};
