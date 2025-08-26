import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";

type User = { id: string; email: string; username: string } | null;

const AuthCtx = createContext<{ user: User; setUser: (u: User) => void; loading: boolean; }>(
  { user: null, setUser: () => { }, loading: true }
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  

  return (
    <AuthCtx.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
