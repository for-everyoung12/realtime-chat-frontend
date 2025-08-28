import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../../shared/components/button';
import { Input } from '../../shared/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/components/avatar';
import { ScrollArea } from '../../shared/components/scroll-area';
import { Badge } from '../../shared/components/badge';
import { ChatRoom, Message } from '../types/chat';
import { useMessages } from '../hooks/useMessages';
import { useChatSocket } from '../hooks/useChatSocket';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatWindowProps {
  room: ChatRoom | null;
  currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ room, currentUserId }) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sử dụng custom hooks
  const {
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    loadMoreMessages,
    markAsRead
  } = useMessages({ room, autoLoad: true });

  const { joinRoom, leaveRoom, startTyping, stopTyping } = useChatSocket({
    onUserTyping: (data) => {
      if (data.roomId === room?.id && data.userId !== currentUserId) {
        setTypingUsers(prev => 
          data.isTyping 
            ? [...prev.filter(id => id !== data.userId), data.userId]
            : prev.filter(id => id !== data.userId)
        );
      }
    }
  });

  // Auto scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join/leave room khi room thay đổi
  useEffect(() => {
    if (room?.id) {
      joinRoom(room.id);
      return () => leaveRoom(room.id);
    }
  }, [room?.id, joinRoom, leaveRoom]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !room) return;

    const text = messageText.trim();
    setMessageText('');
    
    try {
      await sendMessage(text);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  // Xử lý typing
  const handleTyping = () => {
    if (!room) return;

    if (!isTyping) {
      setIsTyping(true);
      startTyping(room.id);
      
      // Tự động dừng typing sau 3 giây
      setTimeout(() => {
        setIsTyping(false);
        stopTyping(room.id);
      }, 3000);
    }
  };

  // Render tin nhắn
  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === currentUserId;
    const showAvatar = !isOwn;

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        {showAvatar && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.sender.avatar} />
            <AvatarFallback>
              {message.sender.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
          {!isOwn && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender.username}
            </div>
          )}
          
          <div
            className={`rounded-lg px-3 py-2 ${
              isOwn
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          
          <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi
            })}
            {isOwn && message.isRead && (
              <span className="ml-1 text-blue-400">✓✓</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Nếu không có room được chọn
  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">💬</div>
          <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={room.participants[0]?.avatar} />
            <AvatarFallback>
              {room.name?.slice(0, 2).toUpperCase() || 
               room.participants[0]?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {room.name || room.participants
                .filter(p => p.id !== currentUserId)
                .map(p => p.username)
                .join(', ')}
            </h3>
            
            <div className="flex items-center gap-2">
              {room.participants.some(p => p.isOnline && p.id !== currentUserId) && (
                <Badge variant="secondary" className="text-xs">
                  Đang hoạt động
                </Badge>
              )}
              
              {typingUsers.length > 0 && (
                <span className="text-xs text-gray-500">
                  đang nhập...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
              disabled={isLoading}
            >
              {isLoading ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map(renderMessage)}
        </div>

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              placeholder="Nhập tin nhắn..."
              className="pr-20"
              maxLength={1000}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-6 h-6"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-6 h-6"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!messageText.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;