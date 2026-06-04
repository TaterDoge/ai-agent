import type { ApiResponse } from "@repo/contracts";
import { createJsonRequestInit, serverURL } from "../client";

export async function getHealth(): Promise<
  ApiResponse<{ service: string; env: string }>
> {
  try {
    const response = await fetch(serverURL("/health"), createJsonRequestInit());

    return await response.json();
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "SYSTEM.UPSTREAM_TIMEOUT" as const,
        message: error instanceof Error ? error.message : "API request failed",
      },
      meta: {
        requestId: "unavailable",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
