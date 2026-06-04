import { Card, CardContent } from "@repo/ui/card";
import Link from "next/link";
import { getWebServerEnv } from "../src/env.server";
import { WebEnvBadge } from "../src/web-env-badge";

const links = [
  { href: "/verify/system/health", label: "GET /health" },
  { href: "/verify/system/ping", label: "POST /rpc/system/ping" },
  { href: "/verify/order/detail", label: "POST /rpc/order/detail" },
];

export default function Home() {
  const env = getWebServerEnv();

  return (
    <section className="py-10">
      <Card className="overflow-hidden border border-border bg-surface-panel shadow-soft">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <p className="font-semibold text-content-tertiary text-xs uppercase tracking-[0.3em]">
              RPC validation
            </p>
            <h2 className="font-semibold text-2xl text-content-primary tracking-tight">
              API endpoint verification
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-content-tertiary text-xs">
            <span className="rounded-full border border-border px-3 py-1">
              server {env.APP_ENV}
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              {env.API_BASE_URL}
            </span>
          </div>
          <WebEnvBadge />
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className="text-content-primary hover:underline"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
