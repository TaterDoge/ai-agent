import { buildSuccess } from "@repo/contracts";
import { Hono } from "hono";
import type { Bindings } from "../../env";
import { getApiEnv } from "../../env";
import { createMeta } from "../../utils/meta";

const health = new Hono<{ Bindings: Bindings }>();

health.get("/", (c) => {
  const env = getApiEnv(c.env);
  return c.json(
    buildSuccess(
      {
        service: "api",
        env: env.APP_ENV,
      },
      createMeta()
    )
  );
});

export default health;
