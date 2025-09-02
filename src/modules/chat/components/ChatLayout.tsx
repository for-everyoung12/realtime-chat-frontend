// ChatLayout.tsx
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { UiFriend, UiChatRoom } from "@/modules/chat/types/ui";
import { useAuth } from "@/app/context/AuthContext";
import { usePresence } from "@/modules/chat/hooks/usePresence";
import { presenceSubscribe, presenceUnsubscribe, presenceWho } from "@/modules/shared/realtime/presence.emitters";

type Friend = UiFriend;
type ChatRoom = UiChatRoom;

const isObjectId = (s?: string | null) => !!s && /^[a-f0-9]{24}$/.test(s);

export function ChatLayout() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");

  const [showSettings, setShowSettings] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  // conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convCursor, setConvCursor] = useState<string | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  // friends
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCursor, setFriendCursor] = useState<string | null>(null);
  const [friendLoading, setFriendLoading] = useState(false);

  const [activePeer, setActivePeer] = useState<Friend | null>(null);

  // Attach presence listeners to update friend statuses
  usePresence(
    (snapshot: Record<string, Friend["status"]>) => {
      setFriends(prev => prev.map(f => ({ ...f, status: snapshot[f.id] || f.status })));
    },
    (update: { userId: string; status: Friend["status"] }) => {
      setFriends(prev => prev.map(f => (f.id === update.userId ? { ...f, status: update.status } : f)));
    }
  );

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
          id: f.friendId,
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

  // Subscribe/unsubscribe presence when friend IDs change (not on status changes)
  const prevSubscribedIds = useRef<string[]>([]);
  useEffect(() => {
    const ids = friends.map(f => f.id);
    const prev = prevSubscribedIds.current;

    // diff
    const added = ids.filter(id => !prev.includes(id));
    const removed = prev.filter(id => !ids.includes(id));

    if (removed.length) presenceUnsubscribe(removed);
    if (added.length) {
      presenceSubscribe(added);
      presenceWho(added).then(ack => {
        if (ack?.statuses) {
          setFriends(prevFriends => prevFriends.map(f => ({
            ...f,
            status: (ack.statuses?.[f.id] as Friend["status"]) || f.status,
          })));
        }
      });
    }

    prevSubscribedIds.current = ids;

    return () => {
      // on unmount, unsubscribe all currently subscribed ids
      if (prevSubscribedIds.current.length) {
        presenceUnsubscribe(prevSubscribedIds.current);
      }
    };
  }, [friends.map(f => f.id).join(",")]);

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

  const handleFriendSelect = async (friendId: string) => {
    if (!user?.id || !isObjectId(user.id) || !isObjectId(friendId)) return;
    try {
      const conv = await ChatService.createConversation({
        type: "single",
        memberIds: [user.id, friendId],
      });
      setActiveChat(conv.id);
      setActiveTab("friends");
      setConversations(prev => (prev.some(c => c.id === conv.id) ? prev : [conv, ...prev]));

      //save user chatting with
      const f = friends.find(x => x.id === friendId) || null;
      setActivePeer(f);
    } catch {
    }
  };

  const handleGroupSelect = (conversationId: string) => {
    if (!isObjectId(conversationId)) return;
    setActiveChat(conversationId);
    setActiveTab("groups");
    setActivePeer(null);
  };

  const activeFriend = friends.find(f => f.id === activeChat);
  const activeGroup = groups.find(g => g.id === activeChat);
  const isValidConversation = isObjectId(activeChat);

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
                    {(activePeer?.name || activeGroup?.name || "C").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {activePeer?.name || activeGroup?.name || "Conversation"}
                  </h3>
                  {activeFriend && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${activeFriend.status === 'online' ? 'bg-green-500' :
                        activeFriend.status === 'away' ? 'bg-yellow-500' :
                          activeFriend.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
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

            <ChatWindow chatId={activeChat} peer={activePeer || undefined} />
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
