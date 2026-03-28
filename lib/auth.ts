import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env, isProduction } from "@/lib/env";
import { fetchBackend } from "@/lib/backend";
import type { User } from "@/lib/types";

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

export const getCurrentUser = cache(async () => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const data = await fetchBackend<{ user: User }>("/api/auth/me", {
      token,
    });
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

export async function requireSeller(nextPath: string) {
  const user = await requireUser(nextPath);
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    redirect("/account?forbidden=seller");
  }
  return user;
}

export function isSellerRole(role?: User["role"] | null) {
  return role === "SELLER" || role === "ADMIN";
}
