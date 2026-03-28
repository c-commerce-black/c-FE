import { fetchBackend } from "@/lib/shared/api";

import type { CartState } from "./types";

export async function getCart(token: string) {
  return fetchBackend<CartState>("/api/cart", { token });
}
