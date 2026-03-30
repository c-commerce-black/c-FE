import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { User } from "@/lib/auth";
import { fetchBackend } from "@/lib/shared/api";
import { env, isProduction } from "@/lib/shared/env";

export function getSessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    name: env.sessionCookieName,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge,
  };
}

export const getSessionToken = cache(async () => {
  const cookieStore = await cookies();
  return cookieStore.get(env.sessionCookieName)?.value ?? null;
});

export async function getMe(token: string) {
  return fetchBackend<{ user: User }>("/api/auth/me", { token });
}

export const getCurrentUser = cache(async () => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const data = await getMe(token);
    return data.user;
  } catch {
    return null;
  }
});

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
