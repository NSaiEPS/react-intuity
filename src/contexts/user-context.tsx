import * as React from "react";

import type { User } from "@/types/user";
import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";
import { getLocalStorage, type IntuityUser } from "@/utils/auth";
import { toast } from "@/lib/custom-toast";

const IDLE_TIMEOUT_MS = 900000; // 15 minutes 
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "pointerdown",
  "click",
];

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(
  undefined
);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({
  children,
}: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{
    user: User | null;
    error: string | null;
    isLoading: boolean;
  }>({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setState((prev) => ({
          ...prev,
          user: null,
          error: "Something went wrong",
          isLoading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        user: data ?? null,
        error: null,
        isLoading: false,
      }));
    } catch (err) {
      logger.error(err);
      setState((prev) => ({
        ...prev,
        user: null,
        error: "Something went wrong",
        isLoading: false,
      }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  const isAuthenticated = Boolean(state.user || getLocalStorage("intuity-user"));

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = React.useRef<number>(0);
  const isLoggingOutRef = React.useRef<boolean>(false);

  const handleIdleLogout = React.useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      const raw = getLocalStorage("intuity-user");
      const stored: IntuityUser | null =
        typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

      const roleId = stored?.body?.acl_role_id;
      const loginUserEmail = stored?.body?.email;
      const userId = stored?.body?.customer_id;
      const token = stored?.body?.token;

      const formData = new FormData();
      if (loginUserEmail) formData.append("email", loginUserEmail);
      if (roleId) formData.append("acl_role_id", roleId);
      if (userId) formData.append("customer_id", userId);

      await authClient.signOut(token ?? "", formData);
      await checkSession();

      toast.warning(
        "You've been logged out",
        "For your security, you were logged out due to inactivity. Please log in again to continue.",
        undefined,
        true
      );
    } catch (err) {
      logger.error("Error during idle logout", err);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [checkSession]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastActivityRef.current < 500) {
        return;
      }
      lastActivityRef.current = now;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        handleIdleLogout();
      }, IDLE_TIMEOUT_MS);
    };

    lastActivityRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleIdleLogout();
    }, IDLE_TIMEOUT_MS);

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, handleIdleLogout]);

  return (
    <UserContext.Provider value={{ ...state, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;

