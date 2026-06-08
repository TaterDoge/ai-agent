// fallow-ignore-file unused-file
import { createHttp } from "@repo/lib";
import { getAdminClientEnv } from "./env.client";
import { getAdminServerEnv } from "./env.server";

function resolveBaseURL() {
  if (typeof window === "undefined") {
    return getAdminServerEnv().API_BASE_URL;
  }

  return getAdminClientEnv().NEXT_PUBLIC_API_BASE_URL;
}

export const http = createHttp(resolveBaseURL);
