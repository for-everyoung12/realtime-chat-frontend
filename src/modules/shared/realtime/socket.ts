// socket.ts
import { io, Socket } from "socket.io-client";

const BASE = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:8081"; 

export const socket: Socket = io(`${BASE}/chat`, {
  transports: ["polling", "websocket"],
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};
export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
