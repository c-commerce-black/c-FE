"use client";

import { useEffect } from "react";

import type { User } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export function AuthStoreHydrator({ user }: { user: User | null }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return null;
}
