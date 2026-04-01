import "server-only";

import { env } from "@/lib/shared/env";

import { createApiInstance } from "./client";

export const backendApi = createApiInstance({
  baseURL: env.apiBaseUrl,
});
