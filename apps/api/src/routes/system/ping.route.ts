import { env } from "cloudflare:workers";
import { buildSuccess, PingRequestSchema } from "@repo/contracts";
import { Elysia } from "elysia";
import { createMeta } from "../../utils/meta";
import { validateBody } from "../../utils/validate";

const ping = new Elysia({ prefix: "/rpc/system/ping" });

ping.post("/", ({ body }) => {
  const payload = validateBody(PingRequestSchema, body);
  return buildSuccess(
    {
      service: "api",
      message: `pong, ${payload.name}`,
      env: env.APP_ENV,
    },
    createMeta()
  );
});

export default ping;
