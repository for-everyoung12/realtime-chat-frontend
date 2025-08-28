
import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { ChatRoom } from '../types/chat';
import { ChatService } from '../services/chat.service';
import { useAuth } from '../../auth';

const ChatLayout: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Giả sử có useAuth hook

  // Load danh sách phòng chat
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const roomList = await ChatService.getRooms();
        setRooms(roomList);
        
        // Tự động chọn room đầu tiên nếu có
        if (roomList.length > 0 && !activeRoom) {
          setActiveRoom(roomList[0]);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách phòng:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleRoomSelect = (room: ChatRoom) => {
    setActiveRoom(room);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Vui lòng đăng nhập để sử dụng chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white">
        <ChatSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onRoomSelect={handleRoomSelect}
          isLoading={isLoading}
          currentUserId={user.id}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        <ChatWindow
          room={activeRoom}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
};

export default ChatLayout;