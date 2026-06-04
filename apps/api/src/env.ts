import { z } from "zod";

export type AppEnv = "development" | "test" | "production";

export type Bindings = {
  APP_ENV: AppEnv;
};

const apiEnvSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]),
});

export function getApiEnv(bindings: Record<string, unknown>): {
  APP_ENV: AppEnv;
} {
  return apiEnvSchema.parse({
    APP_ENV: bindings.APP_ENV,
  });
}
