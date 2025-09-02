import { useEffect, useMemo, useState } from "react";
import { UserPlus, Check, X, Search } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { Input } from "@/modules/shared/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/avatar";
import { getInitialLetter } from "@/modules/shared/lib/utils";
import { Badge } from "@/modules/shared/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/components/tabs";
import { FriendService } from "@/modules/friends/services/friend.service";
import { useNavigate } from "react-router-dom";

interface FriendRequestItem {
  id: string; // requester user id
  friendshipId?: string; // friendship doc id
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  requestedAt?: string | Date;
}

interface FriendRequestsProps {
  onClose: () => void;
}

const mockSentRequests: FriendRequestItem[] = [];

export function FriendRequests({ onClose }: FriendRequestsProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FriendRequestItem[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await FriendService.getPendingFriendRequests({ limit: 20 });
        // Accept both { items: [...] } and { rows: [...] }
        const items = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.rows)
          ? res.rows
          : [];
        const mapped: FriendRequestItem[] = items.map((it: any) => {
          const requester = it.requesterId ?? it.requester ?? {};
          return {
            id: requester._id ?? requester.id ?? it.requesterId ?? it.friendId ?? it.userId,
            friendshipId: it._id ?? it.id,
            name: requester.name ?? requester.username ?? requester.email ?? "Unknown",
            username: requester.username,
            email: requester.email,
            avatar: requester.avatar,
            requestedAt: it.createdAt ?? it.requestedAt,
          } as FriendRequestItem;
        });
        setIncoming(mapped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load accepted friends once to filter search results
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await FriendService.getAcceptedFriends({ limit: 500 });
        const items = Array.isArray(data?.items) ? data.items : [];
        const ids = new Set<string>(
          items.map((it: any) => (it.friendId ?? it.id ?? it._id ?? it.userId)).filter(Boolean)
        );
        setFriendIds(ids);
      } catch (e) {
        // ignore
      }
    };
    loadFriends();
  }, []);

  // Debounced search for users by text input
  useEffect(() => {
    if (!newFriendUsername.trim()) {
      setResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await FriendService.searchUsers(newFriendUsername, { limit: 5 });
        const items = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.rows)
          ? res.rows
          : Array.isArray(res)
          ? res
          : [];
        const mapped: FriendRequestItem[] = items.map((u: any) => ({
          id: u.id ?? u._id ?? u.userId,
          name: u.name ?? u.username ?? u.email ?? "Unknown",
          username: u.username ?? u.email,
          avatar: u.avatar,
        }));
        const filtered = mapped.filter(r => !!r.id && !friendIds.has(r.id));
        setResults(filtered);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [newFriendUsername, friendIds]);

  const handleAcceptRequest = async (requesterUserId: string) => {
    await FriendService.acceptFriendRequest(requesterUserId);
    setIncoming((prev) => prev.filter((r) => r.id !== requesterUserId));
  };

  const handleDeclineRequest = async (requesterUserId: string) => {
    await FriendService.rejectFriendRequest(requesterUserId);
    setIncoming((prev) => prev.filter((r) => r.id !== requesterUserId));
  };

  const handleSendRequest = async () => {
    if (!newFriendUsername.trim()) return;
    try {
      setSending(true);
      // Prefer first current result
      const first = results[0];
      // Fallback to direct search 1 item if results empty
      let userId = first?.id;
      if (!userId) {
        const result = await FriendService.searchUsers(newFriendUsername, { limit: 1 });
        const firstRaw = Array.isArray(result?.items)
          ? result.items[0]
          : Array.isArray(result?.rows)
          ? result.rows[0]
          : Array.isArray(result)
          ? result[0]
          : null;
        userId = firstRaw?.id ?? firstRaw?._id ?? firstRaw?.userId;
      }
      if (userId) {
        await FriendService.sendFriendRequest(userId);
      }
    } finally {
      setSending(false);
      setNewFriendUsername("");
      setResults([]);
    }
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
                {newFriendUsername && (
                  <div className="mt-2 bg-popover border border-card-border rounded-md shadow-sm max-h-60 overflow-auto">
                    {searching ? (
                      <div className="p-3 text-sm text-muted-foreground">Searching...</div>
                    ) : results.length > 0 ? (
                      results.map((u) => (
                        <div
                          key={u.id}
                          className="w-full p-3 hover:bg-accent/50 flex items-center gap-3"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                              {u.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)}>{u.name}</div>
                            {u.username && (
                              <div className="text-xs text-muted-foreground truncate">{u.username}</div>
                            )}
                          </div>
                          {!friendIds.has(u.id) && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => navigate(`/profile/${u.id}`)}>View</Button>
                              <Button size="sm" onClick={() => FriendService.sendFriendRequest(u.id as string)}>Add</Button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground">No results</div>
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleSendRequest}
                disabled={!newFriendUsername.trim() || sending}
                className="bg-gradient-primary hover:shadow-glow"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>

          {/* Friend Requests Tabs */}
          <Tabs defaultValue="incoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-card">
              <TabsTrigger value="incoming" className="relative">
                Incoming
                {incoming.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 px-2 text-xs">
                    {incoming.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({mockSentRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* Incoming Requests */}
            <TabsContent value="incoming" className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : incoming.length > 0 ? (
                incoming.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-card-border"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitialLetter(request.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{request.name}</h4>
                        {request.username && (
                          <span className="text-sm text-muted-foreground">{request.username}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {request.requestedAt && (
                          <span>{formatTimeAgo(new Date(request.requestedAt))}</span>
                        )}
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
                        {getInitialLetter(request.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{request.name}</h4>
                        <span className="text-sm text-muted-foreground">{request.username}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {request.requestedAt && (
                          <span>Sent {formatTimeAgo(new Date(request.requestedAt))}</span>
                        )}
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