import { Card, CardContent } from "@repo/ui/card";
import { postOrderDetail } from "@/api/order/detail.api";
import { getWebServerEnv } from "@/env.server";
import { WebEnvBadge } from "@/web-env-badge";

export default async function OrderDetailPage() {
  const env = getWebServerEnv();
  const payload = { id: "order-001" };
  const result = await postOrderDetail(payload);
  const responseBody = JSON.stringify(result, null, 2);

  return (
    <section className="py-10">
      <Card className="overflow-hidden border border-border bg-surface-panel shadow-soft">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <p className="font-semibold text-content-tertiary text-xs uppercase tracking-[0.3em]">
              RPC validation
            </p>
            <h2 className="font-semibold text-2xl text-content-primary tracking-tight">
              Health check
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
              POST /health
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              {result.ok ? "ok=true" : `code=${result?.error?.code}`}
            </span>
          </div>
          <WebEnvBadge />
          <div className="rounded-2xl border border-border bg-surface-elevated p-4">
            <p className="font-medium text-content-primary text-sm">Response</p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-content-secondary text-xs leading-6">
              {responseBody}
            </pre>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
