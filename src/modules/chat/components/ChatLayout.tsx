import { useState } from "react";
import { MessageCircle, Users, Settings, Phone, Video, Search } from "lucide-react";
import { Button } from "@shared/components/button";
import { Input } from "@shared/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/avatar";
import { Badge } from "@shared/components/badge";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { UserSettings } from "@/modules/profile/components/UserSettings";
import { FriendRequests } from "@/modules/friends/components/FriendRequests";


interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  lastMessage?: string;
  lastSeen?: string;
  unreadCount?: number;
}

interface ChatRoom {
  id: string;
  type: "direct" | "group";
  name: string;
  participants: Friend[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

// Mock data for demo
const mockFriends: Friend[] = [
  { id: "1", name: "Alice Johnson", status: "online", lastMessage: "Hey! How are you?", unreadCount: 2 },
  { id: "2", name: "Bob Smith", status: "away", lastMessage: "See you tomorrow!", lastSeen: "5 min ago" },
  { id: "3", name: "Carol Chen", status: "busy", lastMessage: "Working on the project", lastSeen: "1 hour ago" },
  { id: "4", name: "David Wilson", status: "offline", lastMessage: "Thanks for your help!", lastSeen: "2 hours ago" },
];

const mockGroups: ChatRoom[] = [
  {
    id: "g1",
    type: "group",
    name: "Team Project",
    participants: mockFriends.slice(0, 3),
    lastMessage: "Alice: Let's meet tomorrow",
    lastActivity: "10 min ago",
    unreadCount: 5
  },
  {
    id: "g2", 
    type: "group",
    name: "Family Chat",
    participants: mockFriends.slice(1, 4),
    lastMessage: "Mom: Dinner at 7pm",
    lastActivity: "30 min ago"
  }
];

export function ChatLayout() {
  const [activeChat, setActiveChat] = useState<string | null>("1");
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");
  const [showSettings, setShowSettings] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  const activeFriend = mockFriends.find(f => f.id === activeChat);
  const activeGroup = mockGroups.find(g => g.id === activeChat);
  const activeRoom = activeFriend || activeGroup;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        friends={mockFriends}
        groups={mockGroups}
        activeChat={activeChat}
        activeTab={activeTab}
        onChatSelect={setActiveChat}
        onTabChange={setActiveTab}
        onSettingsOpen={() => setShowSettings(true)}
        onFriendRequestsOpen={() => setShowFriendRequests(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeFriend?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {activeRoom.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{activeRoom.name}</h3>
                  {activeFriend && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        activeFriend.status === 'online' ? 'bg-green-500' :
                        activeFriend.status === 'away' ? 'bg-yellow-500' :
                        activeFriend.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      {activeFriend.status === 'online' ? 'Online' : activeFriend.lastSeen}
                    </p>
                  )}
                  {activeGroup && (
                    <p className="text-xs text-muted-foreground">
                      {activeGroup.participants.length} members
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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

            {/* Chat Messages */}
            <ChatWindow chatId={activeChat} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-primary mb-4">
                Select a Chat
              </h3>
              <p className="text-muted-foreground">
                Choose a contact from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}
      
      {showFriendRequests && (
        <FriendRequests onClose={() => setShowFriendRequests(false)} />
      )}
    </div>
  );
}