import { createHttp } from "@repo/lib";
import { getWebClientEnv } from "@/env.client";
import { getWebServerEnv } from "@/env.server";

function resolveBaseURL() {
  if (typeof window === "undefined") {
    return getWebServerEnv().API_BASE_URL;
  }

  return getWebClientEnv().NEXT_PUBLIC_API_BASE_URL;
}

export const http = createHttp(resolveBaseURL);
