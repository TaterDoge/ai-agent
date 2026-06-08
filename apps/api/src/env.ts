import { env } from "cloudflare:workers";
import { z } from "zod";

const apiEnvSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]),
  ADMIN_ORIGIN: z.url(),
  WEB_ORIGIN: z.url(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function getApiEnv(bindings: CloudflareBindings = env): ApiEnv {
  return apiEnvSchema.parse({
    APP_ENV: bindings.APP_ENV,
    ADMIN_ORIGIN: bindings.ADMIN_ORIGIN,
    WEB_ORIGIN: bindings.WEB_ORIGIN,
  });
}
