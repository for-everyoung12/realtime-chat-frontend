// ChatLayout.tsx
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Users, Settings, Phone, Video, Search } from "lucide-react";
import { Button } from "@shared/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/avatar";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { UserSettings } from "@/modules/profile/components/UserSettings";
import { FriendRequests } from "@/modules/friends/components/FriendRequests";
import { ChatService } from "@/modules/chat/services/chat.service";
import type { Conversation } from "@/modules/chat/types/chat";
import { FriendService, type FriendListItem } from "@/modules/friends/services/friend.service";
import { useAuth } from "@/app/context/AuthContext";

interface Friend {
  id: string;  // friendId (userId của bạn bè)
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  lastMessage?: string;
  lastSeen?: string;
  unreadCount?: number;
}

interface ChatRoom {
  id: string;  // conversationId
  type: "direct" | "group";
  name: string;
  participants: Friend[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

const isObjectId = (s?: string | null) => !!s && /^[a-f0-9]{24}$/.test(s);

export function ChatLayout() {
  const { user } = useAuth(); // cần user.id để gửi memberIds
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");

  const [showSettings, setShowSettings] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  // conversations (để build nhóm, và sync local sau khi tạo mới)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convCursor, setConvCursor] = useState<string | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  // friends
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCursor, setFriendCursor] = useState<string | null>(null);
  const [friendLoading, setFriendLoading] = useState(false);

  // Load conversations
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setConvLoading(true);
      try {
        const page = await ChatService.getConversations({ limit: 50 });
        if (cancelled) return;
        setConversations(page.rows);
        setConvCursor(page.nextCursor ?? null);
      } catch {
        setConversations([]);
        setConvCursor(null);
      } finally {
        if (!cancelled) setConvLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load friends (accepted)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFriendLoading(true);
      try {
        const page = await FriendService.getAcceptedFriends({ limit: 50 });
        if (cancelled) return;
        const mapped: Friend[] = (page.items ?? []).map((f: FriendListItem) => ({
          id: f.friendId, // dùng friendId (userId của bạn bè)
          name: f.name,
          status: (f.presence as Friend["status"]) || "offline",
        }));
        setFriends(mapped);
        setFriendCursor(page.nextCursor ?? null);
      } catch {
        setFriends([]);
        setFriendCursor(null);
      } finally {
        if (!cancelled) setFriendLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Map groups từ conversations
  const groups: ChatRoom[] = useMemo(() => {
    return conversations
      .filter(c => c.type === "group")
      .map<ChatRoom>((c) => ({
        id: c.id,
        type: "group",
        name: c.name || "Group chat",
        participants: [],
        lastMessage: c.lastMessage?.content,
        unreadCount: 0,
      }));
  }, [conversations]);

  // Handler: chọn 1 friend → tạo/mở single conversation
  const handleFriendSelect = async (friendId: string) => {
    if (!user?.id || !isObjectId(user.id) || !isObjectId(friendId)) return;
    try {
      // Backend yêu cầu: { type: "single", memberIds: [me, friend] }
      const conv = await ChatService.createConversation({
        type: "single",
        memberIds: [user.id, friendId],
      });
      setActiveChat(conv.id);           // conversationId
      setActiveTab("friends");
      // sync local list nếu chưa có
      setConversations(prev => (prev.some(c => c.id === conv.id) ? prev : [conv, ...prev]));
    } catch {
      // no-op
    }
  };

  // Handler: chọn 1 group (conversation)
  const handleGroupSelect = (conversationId: string) => {
    if (!isObjectId(conversationId)) return;
    setActiveChat(conversationId);
    setActiveTab("groups");
  };

  // Dùng để hiển thị header (đơn giản)
  const activeFriend = friends.find(f => f.id === activeChat); // chỉ đúng nếu activeChat đang là friendId trước khi create
  const activeGroup  = groups.find(g => g.id === activeChat);
  const isValidConversation = isObjectId(activeChat); // ChatWindow render khi có conversationId hợp lệ

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        friends={friends}
        groups={groups}
        activeChat={activeChat}
        activeTab={activeTab}
        onFriendSelect={handleFriendSelect}
        onGroupSelect={handleGroupSelect}
        onTabChange={setActiveTab}
        onSettingsOpen={() => setShowSettings(true)}
        onFriendRequestsOpen={() => setShowFriendRequests(true)}
        loading={convLoading || friendLoading}
        onLoadMore={async () => {
          // ví dụ: ưu tiên load thêm conversations; có thể tách nút nếu muốn
          if (convCursor) {
            const page = await ChatService.getConversations({ limit: 50, cursor: convCursor });
            setConversations(prev => [...prev, ...page.rows]);
            setConvCursor(page.nextCursor ?? null);
          } else if (friendCursor) {
            const page = await FriendService.getAcceptedFriends({ limit: 50, cursor: friendCursor });
            const mapped: Friend[] = (page.items ?? []).map((f) => ({
              id: f.friendId,
              name: f.name,
              status: (f.presence as Friend["status"]) || "offline",
            }));
            setFriends(prev => [...prev, ...mapped]);
            setFriendCursor(page.nextCursor ?? null);
          }
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {isValidConversation ? (
          <>
            {/* Header */}
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeFriend?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {(activeFriend?.name || activeGroup?.name || "C").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {activeGroup?.name || activeFriend?.name || "Conversation"}
                  </h3>
                  {activeFriend && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        activeFriend.status === 'online' ? 'bg-green-500' :
                        activeFriend.status === 'away'   ? 'bg-yellow-500' :
                        activeFriend.status === 'busy'   ? 'bg-red-500'    : 'bg-gray-400'
                      }`} />
                      {activeFriend.status === 'online' ? 'Online' : activeFriend.lastSeen}
                    </p>
                  )}
                  {activeGroup && <p className="text-xs text-muted-foreground">group</p>}
                </div>
              </div>

              <div className="flex items<center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <ChatWindow chatId={activeChat} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-primary mb-4">Select a Chat</h3>
              <p className="text-muted-foreground">
                Chọn 1 bạn ở Sidebar để mình tạo/mở cuộc trò chuyện
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
      {showFriendRequests && <FriendRequests onClose={() => setShowFriendRequests(false)} />}
    </div>
  );
}
