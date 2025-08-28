import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL; 

export const socket: Socket = io(URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false, // chủ động connect khi user đăng nhập
});

export const connectSocket = () => { if (!socket.connected) socket.connect(); };
export const disconnectSocket = () => { if (socket.connected) socket.disconnect(); };
