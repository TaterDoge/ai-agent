import { env } from "cloudflare:workers";
import { buildSuccess } from "@repo/contracts";
import { Elysia } from "elysia";
import { createMeta } from "../../utils/meta";

const health = new Elysia({ prefix: "/health" });

health.get("/", () =>
  buildSuccess(
    {
      service: "api",
      env: env.APP_ENV,
    },
    createMeta()
  )
);

export default health;
