import {API} from '@/modules/shared/api/endpoints'
import { http} from '@/modules/shared/api/http'

export type FriendPresence = "online" | "away" | "busy" | "offline";

export interface FriendListItem {
  friendshipId: string;
  friendId: string;
  name: string;
  email?: string;
  presence?: FriendPresence;
  createdAt?: string;
  updatedAt?: string;
}

export type FriendListPage = {
  items: FriendListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number | null;
};

export const FriendService = {
  getAcceptedFriends: (params?: { limit?: number; cursor?: string }) =>
    http
      .get<FriendListPage>(API.friend.LIST, {
        params: { status: "accepted", ...params },
      })
      .then(res => res.data),

  searchUsers: (q: string, params?: { cursor?: string; limit?: number }) =>
    http.get(API.user.SEARCH(q, params?.cursor, params?.limit)).then(res => res.data),

  getPendingFriendRequests: (params?: { limit?: number; cursor?: string }) =>
    http
      .get(API.friend.LIST_PENDING, {
        params,
      })
      .then(res => res.data),

  sendFriendRequest: (userId: string) =>
    http.post(API.friend.FRIEND_REQUEST(userId)).then(res => res.data),

  acceptFriendRequest: (userId: string) =>
    http.post(API.friend.FRIEND_ACCEPT(userId)).then(res => res.data),

  rejectFriendRequest: (userId: string) =>
    http.post(API.friend.FRIEND_REJECT(userId)).then(res => res.data),

  blockUser: (userId: string) =>
    http.post(API.friend.FRIEND_BLOCK(userId)).then(res => res.data),

  unblockUser: (userId: string) =>
    http.post(API.friend.FRIEND_UNBLOCK(userId)).then(res => res.data),
};