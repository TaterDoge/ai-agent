import { zValidator } from "@hono/zod-validator";
import {
  BizCode,
  buildFailure,
  buildSuccess,
  PingRequestSchema,
} from "@repo/contracts";
import { Hono } from "hono";
import z from "zod";
import type { Bindings } from "../../env";
import { getApiEnv } from "../../env";
import { createMeta } from "../../utils/meta";

const ping = new Hono<{ Bindings: Bindings }>();

ping.post(
  "/",
  zValidator("json", PingRequestSchema, (result, c) => {
    if (result.success) {
      return;
    }

    const res = {
      code: BizCode.COMMON_INVALID_REQUEST,
      message: "Invalid request payload",
      details: z.flattenError(result.error),
    };

    return c.json(buildFailure(res, createMeta()), 400);
  }),
  (c) => {
    const payload = c.req.valid("json");
    const env = getApiEnv(c.env);
    return c.json(
      buildSuccess(
        {
          service: "api",
          message: `pong, ${payload.name}`,
          env: env.APP_ENV,
        },
        createMeta()
      )
    );
  }
);

export default ping;
