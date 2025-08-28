import { useState, useEffect, useCallback } from 'react';
import { Message, ChatRoom } from '../types/chat';
import { ChatService } from '../services/chat.service';
import { useChatSocket } from './useChatSocket';

interface UseMessagesOptions {
  room: ChatRoom | null;
  autoLoad?: boolean;
}

export const useMessages = ({ room, autoLoad = true }: UseMessagesOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Xử lý tin nhắn mới từ socket
  const handleNewMessage = useCallback((data: { message: Message }) => {
    if (data.message.roomId === room?.id) {
      setMessages(prev => [...prev, data.message]);
    }
  }, [room?.id]);

  // Sử dụng socket để nhận tin nhắn real-time
  const { sendMessage: sendSocketMessage } = useChatSocket({
    onMessageReceived: handleNewMessage,
  });

  // Load tin nhắn từ API
  const loadMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!room?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const newMessages = await ChatService.getMessages(room.id, pageNum, 50);
      
      if (append) {
        setMessages(prev => [...newMessages.reverse(), ...prev]);
      } else {
        setMessages(newMessages.reverse()); // Reverse để tin nhắn mới nhất ở dưới
      }

      setHasMore(newMessages.length === 50);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải tin nhắn');
    } finally {
      setIsLoading(false);
    }
  }, [room?.id]);

  // Load thêm tin nhắn cũ hơn (pagination)
  const loadMoreMessages = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMessages(page + 1, true);
    }
  }, [loadMessages, page, isLoading, hasMore]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (content: string) => {
    if (!room?.id || !content.trim()) return;

    try {
      // Gửi qua API
      const newMessage = await ChatService.sendMessage(room.id, {
        content: content.trim(),
        messageType: 'text'
      });

      // Cập nhật local state
      setMessages(prev => [...prev, newMessage]);

      // Gửi qua socket để notify người khác
      sendSocketMessage(room.id, {
        content: content.trim(),
        messageType: 'text'
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi gửi tin nhắn');
      throw err;
    }
  }, [room?.id, sendSocketMessage]);

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = useCallback(async (messageId: string) => {
    if (!room?.id) return;

    try {
      await ChatService.markAsRead(room.id, messageId);
      
      // Cập nhật local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  }, [room?.id]);

  // Load tin nhắn khi room thay đổi
  useEffect(() => {
    if (autoLoad && room?.id) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      loadMessages(1, false);
    }
  }, [room?.id, autoLoad, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    refetch: () => loadMessages(1, false),
  };
};