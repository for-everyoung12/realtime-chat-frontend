import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfileService } from "@/modules/profile/services/profile.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/modules/shared/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/avatar";

type RemoteUser = {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
};

export function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<RemoteUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await ProfileService.profile(id);
        setUser(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-6 text-muted-foreground">User not found.</div>;
  }

  const displayName = user.name ?? user.username ?? user.email ?? "Unknown";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Basic information about this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold text-foreground">{displayName}</div>
              {user.email && <div className="text-sm text-muted-foreground">{user.email}</div>}
              {user.bio && <div className="mt-2 text-sm text-foreground">{user.bio}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


