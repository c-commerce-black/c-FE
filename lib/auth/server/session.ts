import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, type User } from "@/lib/auth";
import { unwrapApiResponse } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import { isProduction } from "@/lib/shared/env";

export function getSessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge,
  };
}

export const getSessionToken = cache(async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
});

export async function getMe(token: string) {
  const response = await backendApi.get("/api/auth/me", { token });
  return unwrapApiResponse<{ user: User }>(
    response,
    "사용자 정보를 불러오지 못했습니다.",
  );
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
