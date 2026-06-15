"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { AuthContext, type AuthStore, type AuthStatus } from "./store";
import { type AuthUser, authApi } from "./api";

type State = { user: AuthUser | null; status: AuthStatus };
type Action = { type: "set"; user: AuthUser } | { type: "clear" };

function authReducer(_state: State, action: Action): State {
  if (action.type === "set") return { user: action.user, status: "authenticated" };
  return { user: null, status: "guest" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ user, status }, dispatch] = useReducer(authReducer, {
    user: null,
    status: "loading",
  });

  const fetchUser = useCallback(async () => {
    const u = await authApi.me();
    dispatch(u ? { type: "set", user: u } : { type: "clear" });
  }, []);

  const register = useCallback(
    async (payload: Parameters<AuthStore["register"]>[0]) => {
      const result = await authApi.register(payload);
      dispatch({ type: "set", user: result.user });
      return result.newBadges;
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    dispatch({ type: "set", user: u });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch({ type: "clear" });
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const value = useMemo<AuthStore>(
    () => ({ user, status, fetchUser, register, login, logout }),
    [user, status, fetchUser, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
