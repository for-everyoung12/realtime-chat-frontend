import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types/chat';

interface UseChatSocketOptions {
  onMessageReceived?: (data: SocketEvents['message-received']) => void;
  onUserJoined?: (data: SocketEvents['user-joined']) => void;
  onUserLeft?: (data: SocketEvents['user-left']) => void;
  onUserTyping?: (data: SocketEvents['user-typing']) => void;
  onRoomUpdated?: (data: SocketEvents['room-updated']) => void;
}

export const useChatSocket = (options: UseChatSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Khởi tạo socket connection
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Đăng ký event listeners
    if (options.onMessageReceived) {
      socket.on('message-received', options.onMessageReceived);
    }
    if (options.onUserJoined) {
      socket.on('user-joined', options.onUserJoined);
    }
    if (options.onUserLeft) {
      socket.on('user-left', options.onUserLeft);
    }
    if (options.onUserTyping) {
      socket.on('user-typing', options.onUserTyping);
    }
    if (options.onRoomUpdated) {
      socket.on('room-updated', options.onRoomUpdated);
    }

    // Cleanup khi component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Tham gia phòng chat
  const joinRoom = (roomId: string) => {
    socketRef.current?.emit('join-room', { roomId });
  };

  // Rời khỏi phòng chat
  const leaveRoom = (roomId: string) => {
    socketRef.current?.emit('leave-room', { roomId });
  };

  // Gửi tin nhắn qua socket
  const sendMessage = (roomId: string, message: SocketEvents['send-message']['message']) => {
    socketRef.current?.emit('send-message', { roomId, message });
  };

  // Bắt đầu typing
  const startTyping = (roomId: string) => {
    socketRef.current?.emit('typing-start', { roomId });
  };

  // Dừng typing
  const stopTyping = (roomId: string) => {
    socketRef.current?.emit('typing-stop', { roomId });
  };

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };
};