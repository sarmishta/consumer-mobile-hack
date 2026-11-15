import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Id } from "../../convex/_generated/dataModel";

const KEY = "raincheck.userId";

type Session = {
  ready: boolean;
  userId: Id<"users"> | null;
  setUserId: (id: Id<"users"> | null) => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserIdState] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((value) => setUserIdState(value as Id<"users"> | null))
      .catch((error) => console.warn("Could not read session from SecureStore", error))
      .finally(() => setReady(true));
  }, []);

  const setUserId = useCallback(async (id: Id<"users"> | null) => {
    setUserIdState(id);
    try {
      if (id) await SecureStore.setItemAsync(KEY, id);
      else await SecureStore.deleteItemAsync(KEY);
    } catch (error) {
      console.warn("Could not persist session to SecureStore", error);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ ready, userId, setUserId }}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}
