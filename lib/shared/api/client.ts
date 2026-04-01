import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { logUnexpectedApiResponse, resolveApiResponse } from "./response";

type Primitive = string | number | boolean;

declare module "axios" {
  export interface AxiosRequestConfig {
    fallbackMessage?: string;
    token?: string | null;
  }
}

function readContentType(headers: unknown) {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  const value = (headers as Record<string, unknown>)["content-type"];
  return typeof value === "string" ? value : null;
}

function serializeParams(
  params: Record<string, Primitive | null | undefined> | undefined,
) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

export function createApiInstance(
  config: AxiosRequestConfig = {},
): AxiosInstance {
  const instance = axios.create({
    ...config,
    headers: {
      Accept: "application/json",
      ...config.headers,
    },
    paramsSerializer: {
      serialize: (params) =>
        serializeParams(
          params as Record<string, Primitive | null | undefined> | undefined,
        ),
    },
  });

  instance.interceptors.request.use((request) => {
    if (!request.token) {
      return request;
    }

    request.headers = request.headers ?? {};
    request.headers.Authorization = `Bearer ${request.token}`;

    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const fallbackMessage =
        error.config?.fallbackMessage ?? "요청을 처리하지 못했습니다.";

      if (error.response) {
        const { payload, unexpected, reason } = resolveApiResponse(
          error.response.data,
          error.response.status,
          fallbackMessage,
          readContentType(error.response.headers),
        );

        error.response.data = payload;

        if (unexpected) {
          logUnexpectedApiResponse(error.response, reason);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const appApi = createApiInstance();
