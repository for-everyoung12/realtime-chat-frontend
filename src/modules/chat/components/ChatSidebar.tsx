import { useState } from "react";
import { Users, MessageCircle, Search, Plus, Settings, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { Input } from "@/modules/shared/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/avatar";
import { Badge } from "@/modules/shared/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/components/tabs";

interface Friend {
  id: string; // friendId (userId của bạn bè)
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  lastMessage?: string;
  lastSeen?: string;
  unreadCount?: number;
}

interface ChatRoom {
  id: string; // conversationId
  type: "direct" | "group";
  name: string;
  participants: Friend[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

interface ChatSidebarProps {
  friends: Friend[];
  groups: ChatRoom[];
  activeChat: string | null;
  activeTab: "friends" | "groups";
  onFriendSelect: (friendId: string) => void;
  onGroupSelect: (conversationId: string) => void;
  onTabChange: (tab: "friends" | "groups") => void;
  onSettingsOpen: () => void;
  onFriendRequestsOpen: () => void;
  loading?: boolean;
  onLoadMore?: () => void;
}

export function ChatSidebar({
  friends,
  groups,
  activeChat,
  activeTab,
  onFriendSelect,
  onGroupSelect,
  onTabChange,
  onSettingsOpen,
  onFriendRequestsOpen,
  loading,
  onLoadMore,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary">ChatApp</h1>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={onFriendRequestsOpen}
              aria-label="Friend requests"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={onSettingsOpen}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as "friends" | "groups")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        {/* Friends List */}
        <TabsContent value="friends" className="flex-1 mt-4 px-2">
          <div className="space-y-1">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onFriendSelect(friend.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors hover:bg-accent/50 ${
                    activeChat === friend.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {friend.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Presence dot */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                          friend.status === "online"
                            ? "bg-green-500"
                            : friend.status === "away"
                            ? "bg-yellow-500"
                            : friend.status === "busy"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground truncate">{friend.name}</h4>
                        {friend.unreadCount ? (
                          <Badge variant="destructive" className="h-5 px-2 text-xs">
                            {friend.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                      {friend.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {friend.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No friends found</p>
              </div>
            )}
            <div className="flex justify-center py-3">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                onLoadMore && (
                  <Button size="sm" variant="ghost" onClick={onLoadMore}>
                    Load more
                  </Button>
                )
              )}
            </div>
          </div>
        </TabsContent>

        {/* Groups List */}
        <TabsContent value="groups" className="flex-1 mt-4 px-2">
          <div className="space-y-1">
            <Button variant="outline" className="w-full mb-3 border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>

            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onGroupSelect(group.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors hover:bg-accent/50 ${
                    activeChat === group.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Users className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground truncate">{group.name}</h4>
                        {group.unreadCount ? (
                          <Badge variant="destructive" className="h-5 px-2 text-xs">
                            {group.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                      {group.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {group.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No groups found</p>
              </div>
            )}
            <div className="flex justify-center py-3">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                onLoadMore && (
                  <Button size="sm" variant="ghost" onClick={onLoadMore}>
                    Load more
                  </Button>
                )
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
