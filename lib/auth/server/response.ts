import type { User } from "@/lib/auth";
import { jsonApiResponse } from "@/lib/shared/api/server";
import type { ApiResponse } from "@/lib/shared/types";

import { getSessionCookieOptions } from "./session";

type AuthSessionData = {
  user: User;
  accessToken: string;
  expiresIn: number;
};

type AuthSessionSuccessResponse = Extract<
  ApiResponse<AuthSessionData>,
  { success: true }
>;

function hasSessionCookieData(
  payload: ApiResponse<unknown> | null | undefined,
): payload is AuthSessionSuccessResponse {
  if (!payload || !payload.success) {
    return false;
  }

  const { data } = payload;

  return (
    typeof data === "object" &&
    data !== null &&
    "accessToken" in data &&
    typeof data.accessToken === "string" &&
    "expiresIn" in data &&
    typeof data.expiresIn === "number"
  );
}

export function createSessionAuthResponse({
  status,
  payload,
  fallbackMessage,
}: {
  status: number;
  payload?: ApiResponse<unknown> | null;
  fallbackMessage: string;
}) {
  const response = jsonApiResponse({
    status,
    payload,
    fallbackMessage,
  });

  if (hasSessionCookieData(payload)) {
    response.cookies.set({
      ...getSessionCookieOptions(payload.data.expiresIn),
      value: payload.data.accessToken,
    });
  }

  return response;
}
