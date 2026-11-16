import { useQuery } from "convex/react";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

const KEY = "raincheck.userId";
const ACTIVE_KEY = "raincheck.activeGroupId";

type Session = {
  ready: boolean;
  userId: Id<"users"> | null;
  setUserId: (id: Id<"users"> | null) => Promise<void>;
  activeGroupId: Id<"groups"> | null;
  setActiveGroupId: (id: Id<"groups"> | null) => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserIdState] = useState<Id<"users"> | null>(null);
  const [activeGroupId, setActiveGroupIdState] = useState<Id<"groups"> | null>(null);

  useEffect(() => {
    Promise.all([SecureStore.getItemAsync(KEY), SecureStore.getItemAsync(ACTIVE_KEY)])
      .then(([value, active]) => {
        setUserIdState(value as Id<"users"> | null);
        setActiveGroupIdState(active as Id<"groups"> | null);
      })
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

  const setActiveGroupId = useCallback(async (id: Id<"groups"> | null) => {
    setActiveGroupIdState(id);
    try {
      if (id) await SecureStore.setItemAsync(ACTIVE_KEY, id);
      else await SecureStore.deleteItemAsync(ACTIVE_KEY);
    } catch (error) {
      console.warn("Could not persist active crew to SecureStore", error);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ ready, userId, setUserId, activeGroupId, setActiveGroupId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}

export type CurrentMember =
  | { status: "loading"; userId: Id<"users"> | null; user: null; member: null; group: null }
  | { status: "signedOut"; userId: null; user: null; member: null; group: null }
  | { status: "noGroup"; userId: Id<"users">; user: Doc<"users">; member: null; group: null }
  | { status: "ready"; userId: Id<"users">; user: Doc<"users">; member: Doc<"members">; group: Doc<"groups"> };

/** The signed-in user plus the membership and group of the active crew (default: most recent). A stale stored userId counts as signedOut. */
export function useCurrentMember(): CurrentMember {
  const { ready, userId, activeGroupId } = useSession();
  const user = useQuery(api.users.get, userId ? { userId } : "skip");
  const crews = useQuery(api.crews.mine, userId && user ? { userId } : "skip");
  const mine = crews && (crews.find((c) => c.group._id === activeGroupId) ?? crews[0] ?? null);
  const empty = { user: null, member: null, group: null } as const;
  if (!ready) return { status: "loading", userId, ...empty };
  if (!userId || user === null) return { status: "signedOut", ...empty, userId: null };
  if (user === undefined || mine === undefined) return { status: "loading", userId, ...empty };
  if (mine === null) return { status: "noGroup", userId, user, member: null, group: null };
  return { status: "ready", userId, user, member: mine.member, group: mine.group };
}
