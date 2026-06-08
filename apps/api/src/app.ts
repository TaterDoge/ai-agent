import { env } from "cloudflare:workers";
import { cors } from "@elysiajs/cors";
import { BizCode, buildFailure } from "@repo/contracts";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { z } from "zod";
import { AppError } from "./core/app-error";
import { getApiEnv } from "./env";
import routes from "./routes";
import { createMeta } from "./utils/meta";
import { ValidationError } from "./utils/validate";

export const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    cors({
      origin: (request) => {
        const apiEnv = getApiEnv(env);
        const allowedOrigins = new Set([
          apiEnv.ADMIN_ORIGIN,
          apiEnv.WEB_ORIGIN,
        ]);
        const origin = request.headers.get("origin");
        if (!origin) {
          return true;
        }
        return allowedOrigins.has(origin);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .onError(({ code, error, set }) => {
    const meta = createMeta();

    if (error instanceof AppError) {
      set.status = error.status;
      return buildFailure(
        {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta
      );
    }

    if (error instanceof ValidationError) {
      set.status = 400;
      return buildFailure(
        {
          code: BizCode.COMMON_INVALID_REQUEST,
          message: "Invalid request payload",
          details: z.flattenError(error.error),
        },
        meta
      );
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return buildFailure(
        {
          code: BizCode.COMMON_NOT_FOUND,
          message: "Not found",
        },
        meta
      );
    }

    if (code === "PARSE") {
      set.status = 400;
      return buildFailure(
        {
          code: BizCode.COMMON_INVALID_REQUEST,
          message: "Invalid request body",
        },
        meta
      );
    }

    console.error(error);
    set.status = 500;
    return buildFailure(
      {
        code: BizCode.SYSTEM_INTERNAL_ERROR,
        message: "Internal server error",
      },
      meta
    );
  })
  .use(routes)
  .compile();

export type AppType = typeof app;
