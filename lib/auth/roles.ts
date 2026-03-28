import type { User } from "./types";

export function isSellerRole(role?: User["role"] | null) {
  return role === "SELLER" || role === "ADMIN";
}
