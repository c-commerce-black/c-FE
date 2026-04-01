import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
