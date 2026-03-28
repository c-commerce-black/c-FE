import { cookies } from "next/headers";

import { env } from "@/lib/shared/env";

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(env.sessionCookieName)?.value ?? null;
}
