# Chat Module - Hướng dẫn sử dụng

## Tổng quan

Module Chat cung cấp chức năng chat real-time với các tính năng:

- Gửi/nhận tin nhắn real-time qua Socket.IO
- Hiển thị trạng thái online/offline
- Typing indicators
- Pagination cho tin nhắn cũ
- UI responsive với Tailwind CSS

## Cấu trúc file

```
src/modules/chat/
├── components/
│   ├── ChatLayout.tsx     # Layout chính
│   ├── ChatWindow.tsx     # Cửa sổ chat
│   └── ChatSidebar.tsx    # Sidebar danh sách phòng
├── hooks/
│   ├── useChatSocket.ts   # Socket connection hook
│   └── useMessages.ts     # Messages management hook
├── services/
│   └── chat.service.ts    # API calls
├── types/
│   └── chat.ts           # TypeScript interfaces
└── README.md
```

## Cách sử dụng ChatWindow

### 1. Import và sử dụng cơ bản

```tsx
import ChatWindow from '@/modules/chat/components/ChatWindow';
import { ChatRoom } from '@/modules/chat/types/chat';

const MyComponent = () => {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const currentUserId = 'user-123';

  return (
    <ChatWindow 
      room={selectedRoom}
      currentUserId={currentUserId}
    />
  );
};
```

### 2. Props của ChatWindow

```tsx
interface ChatWindowProps {
  room: ChatRoom | null;        // Phòng chat hiện tại
  currentUserId: string;        // ID của user hiện tại
}
```

### 3. Sử dụng với ChatLayout (Recommended)

```tsx
import ChatLayout from '@/modules/chat/components/ChatLayout';

const ChatPage = () => {
  return <ChatLayout />;
};
```

## API Calls

### 1. ChatService methods

```tsx
import { ChatService } from '@/modules/chat/services/chat.service';

// Lấy danh sách phòng
const rooms = await ChatService.getRooms();

// Lấy tin nhắn
const messages = await ChatService.getMessages(roomId, page, limit);

// Gửi tin nhắn
const newMessage = await ChatService.sendMessage(roomId, {
  content: 'Hello world!',
  messageType: 'text'
});

// Tham gia phòng
await ChatService.joinRoom(roomId);

// Rời phòng
await ChatService.leaveRoom(roomId);
```

### 2. Sử dụng hooks

```tsx
import { useMessages } from '@/modules/chat/hooks/useMessages';
import { useChatSocket } from '@/modules/chat/hooks/useChatSocket';

const MyComponent = () => {
  // Hook quản lý tin nhắn
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMoreMessages
  } = useMessages({ room, autoLoad: true });

  // Hook kết nối socket
  const { joinRoom, leaveRoom, startTyping, stopTyping } = useChatSocket({
    onMessageReceived: (data) => {
      console.log('Tin nhắn mới:', data.message);
    },
    onUserTyping: (data) => {
      console.log('User đang typing:', data);
    }
  });

  return (
    <div>
      {/* UI của bạn */}
    </div>
  );
};
```

## Socket Events

### Outgoing events (Client → Server)
- `join-room`: Tham gia phòng chat
- `leave-room`: Rời phòng chat  
- `send-message`: Gửi tin nhắn
- `typing-start`: Bắt đầu typing
- `typing-stop`: Dừng typing

### Incoming events (Server → Client)
- `message-received`: Nhận tin nhắn mới
- `user-joined`: User tham gia phòng
- `user-left`: User rời phòng
- `user-typing`: User đang typing
- `room-updated`: Phòng được cập nhật

## Cấu hình Environment

Thêm vào file `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=ws://localhost:3001
```

## Styling

Component sử dụng Tailwind CSS classes. Để customize giao diện:

```tsx
// Ví dụ custom message bubble
<div className={`rounded-lg px-3 py-2 ${
  isOwn
    ? 'bg-blue-500 text-white ml-auto'  // Tin nhắn của mình
    : 'bg-gray-100 text-gray-900'       // Tin nhắn của người khác
}`}>
  {message.content}
</div>
```

## Error Handling

```tsx
const MyComponent = () => {
  const { messages, error, sendMessage } = useMessages({ room });

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
      // Hiển thị thông báo lỗi cho user
    }
  };

  if (error) {
    return <div className="text-red-500">Lỗi: {error}</div>;
  }

  return (
    // UI component
  );
};
```

## Performance Tips

1. **Pagination**: Sử dụng `loadMoreMessages()` để tải tin nhắn cũ
2. **Debounce typing**: Typing events được debounce tự động
3. **Message virtualization**: Với room có nhiều tin nhắn, consider sử dụng react-window
4. **Socket cleanup**: Hooks tự động cleanup khi component unmount

## Dependencies

```json
{
  "socket.io-client": "^4.x.x",
  "date-fns": "^2.x.x", 
  "lucide-react": "^0.x.x"
}
```

## Troubleshooting

### Socket không kết nối được
- Kiểm tra `VITE_SOCKET_URL` trong .env
- Đảm bảo server socket đang chạy
- Kiểm tra CORS settings

### API calls bị lỗi
- Kiểm tra `VITE_API_URL` trong .env  
- Đảm bảo user đã authenticate
- Kiểm tra network tab trong DevTools

### Messages không real-time
- Kiểm tra socket connection status
- Đảm bảo đã join room trước khi gửi tin nhắn
- Kiểm tra server-side socket handlers