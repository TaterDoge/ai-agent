import type { ApiResponse } from "@repo/contracts";
import { BizCode } from "@repo/contracts";

// ─── 通用类型 ────────────────────────────────────

export type HttpQuery = Record<string, string | number | boolean | undefined>;

export type HttpGetOptions = {
  query?: HttpQuery;
  init?: RequestInit;
};

export type HttpPostOptions = {
  init?: RequestInit;
};

// ─── 通用工具函数 ─────────────────────────────────

export function buildSearchParams(query?: HttpQuery): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    params.set(key, String(value));
  }

  const search = params.toString();

  return search ? `?${search}` : "";
}

export function createRequestInit(
  method: "GET" | "POST",
  payload: unknown,
  init?: RequestInit
): RequestInit {
  if (method === "GET") {
    return {
      method,
      ...init,
    };
  }

  return {
    method,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(payload),
    ...init,
  };
}

// ─── 工厂函数 ─────────────────────────────────────

export type BaseURLResolver = () => string;

export function createHttp(resolveBaseURL: BaseURLResolver) {
  async function request<TData>(
    method: "GET" | "POST",
    path: string,
    options?: {
      payload?: unknown;
      query?: HttpQuery;
      init?: RequestInit;
    }
  ): Promise<ApiResponse<TData>> {
    try {
      const url = new URL(
        `${path}${buildSearchParams(options?.query)}`,
        resolveBaseURL()
      ).toString();

      const response = await fetch(
        url,
        createRequestInit(method, options?.payload, options?.init)
      );

      return await response.json();
    } catch (error) {
      return {
        ok: false,
        error: {
          code: BizCode.SYSTEM_UPSTREAM_TIMEOUT,
          message:
            error instanceof Error ? error.message : "API request failed",
        },
        meta: {
          requestId: "unavailable",
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  return {
    get<TData>(path: string, options?: HttpGetOptions) {
      return request<TData>("GET", path, {
        query: options?.query,
        init: options?.init,
      });
    },
    post<TReq, TData>(path: string, payload: TReq, options?: HttpPostOptions) {
      return request<TData>("POST", path, {
        payload,
        init: options?.init,
      });
    },
  };
}
