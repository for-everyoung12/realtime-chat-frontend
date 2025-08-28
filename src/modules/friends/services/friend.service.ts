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
};