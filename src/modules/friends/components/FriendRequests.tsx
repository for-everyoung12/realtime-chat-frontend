import { useState } from "react";
import { UserPlus, Check, X, Search } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { Input } from "@/modules/shared/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/avatar";
import { Badge } from "@/modules/shared/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/components/tabs";

interface FriendRequest {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  mutualFriends: number;
  requestDate: Date;
}

interface FriendRequestsProps {
  onClose: () => void;
}

const mockIncomingRequests: FriendRequest[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    username: "@sarahw",
    mutualFriends: 3,
    requestDate: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: "2", 
    name: "Mike Johnson",
    username: "@mikej",
    mutualFriends: 1,
    requestDate: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }
];

const mockSentRequests: FriendRequest[] = [
  {
    id: "3",
    name: "Emily Davis",
    username: "@emilyd",
    mutualFriends: 2,
    requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

export function FriendRequests({ onClose }: FriendRequestsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendUsername, setNewFriendUsername] = useState("");

  const handleAcceptRequest = (requestId: string) => {
    console.log("Accepting friend request:", requestId);
    // Handle accept logic
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log("Declining friend request:", requestId);
    // Handle decline logic
  };

  const handleSendRequest = () => {
    if (!newFriendUsername.trim()) return;
    console.log("Sending friend request to:", newFriendUsername);
    setNewFriendUsername("");
    // Handle send request logic
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur border-card-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl text-foreground">Friends</CardTitle>
            <CardDescription>Manage your friend requests and connections</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add Friend Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Friends
            </h3>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter username or email"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
                  className="bg-chat-input border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button 
                onClick={handleSendRequest}
                disabled={!newFriendUsername.trim()}
                className="bg-gradient-primary hover:shadow-glow"
              >
                Send Request
              </Button>
            </div>
          </div>

          {/* Friend Requests Tabs */}
          <Tabs defaultValue="incoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-card">
              <TabsTrigger value="incoming" className="relative">
                Incoming
                {mockIncomingRequests.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 px-2 text-xs">
                    {mockIncomingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({mockSentRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* Incoming Requests */}
            <TabsContent value="incoming" className="space-y-4">
              {mockIncomingRequests.length > 0 ? (
                mockIncomingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-card-border"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {request.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{request.name}</h4>
                        <span className="text-sm text-muted-foreground">{request.username}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{request.mutualFriends} mutual friends</span>
                        <span>{formatTimeAgo(request.requestDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-success hover:bg-success/90 text-success-foreground"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">No pending requests</h4>
                  <p className="text-muted-foreground">You have no incoming friend requests at the moment</p>
                </div>
              )}
            </TabsContent>

            {/* Sent Requests */}
            <TabsContent value="sent" className="space-y-4">
              {mockSentRequests.length > 0 ? (
                mockSentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-card-border"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {request.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{request.name}</h4>
                        <span className="text-sm text-muted-foreground">{request.username}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{request.mutualFriends} mutual friends</span>
                        <span>Sent {formatTimeAgo(request.requestDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">No sent requests</h4>
                  <p className="text-muted-foreground">You haven't sent any friend requests recently</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}