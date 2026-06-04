import type { AppType } from "@repo/api";
import {
  type ApiResponse,
  BizCode,
  type PingRequest,
  type PingResponse,
} from "@repo/contracts";
import { Card, CardContent } from "@repo/ui/card";
import { hc, type InferResponseType } from "hono/client";
import type { Metadata } from "next";

import { getWebServerEnv } from "../src/env.server";
import { WebEnvBadge } from "../src/web-env-badge";

export const metadata: Metadata = {
  title: "AI Agent RPC Validation",
  description: "Validate shared contracts between the web app and API worker.",
};

const rpcPayload: PingRequest = { name: "web" };

type PingRpcResponse = InferResponseType<
  ReturnType<typeof hc<AppType>>["rpc"]["system"]["ping"]["$post"]
>;

async function getPingResponse(apiBaseUrl: string): Promise<PingRpcResponse> {
  const client = hc<AppType>(apiBaseUrl);

  try {
    const response = await client.rpc.system.ping.$post({
      json: rpcPayload,
    });

    return await response.json();
  } catch (error) {
    return {
      ok: false,
      error: {
        code: BizCode.SYSTEM_UPSTREAM_TIMEOUT,
        message: error instanceof Error ? error.message : "API request failed",
      },
      meta: {
        requestId: "unavailable",
        timestamp: new Date().toISOString(),
      },
    } satisfies ApiResponse<PingResponse>;
  }
}

export default async function Home() {
  const env = getWebServerEnv();
  const pingResult = await getPingResponse(env.API_BASE_URL);
  const requestBody = JSON.stringify(rpcPayload, null, 2);
  const responseBody = JSON.stringify(pingResult, null, 2);

  return (
    <section className="py-10">
      <Card className="overflow-hidden border border-border bg-surface-panel shadow-soft">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <p className="font-semibold text-content-tertiary text-xs uppercase tracking-[0.3em]">
              RPC validation
            </p>
            <h2 className="font-semibold text-2xl text-content-primary tracking-tight">
              Shared request and response contract
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-content-tertiary text-xs">
            <span className="rounded-full border border-border px-3 py-1">
              server {env.APP_ENV}
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              {env.API_BASE_URL}
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              POST /rpc/system/ping
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              {pingResult.ok ? "ok=true" : `code=${pingResult?.error?.code}`}
            </span>
          </div>
          <WebEnvBadge />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <p className="font-medium text-content-primary text-sm">
                Request
              </p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-content-secondary text-xs leading-6">
                {requestBody}
              </pre>
            </div>
            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <p className="font-medium text-content-primary text-sm">
                Response
              </p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-content-secondary text-xs leading-6">
                {responseBody}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
