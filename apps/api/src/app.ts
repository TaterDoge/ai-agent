import type { BizCodeKey } from "@repo/contracts";
import { BizCode, buildFailure } from "@repo/contracts";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Bindings } from "./env";
import routes from "./routes";
import { createMeta } from "./utils/meta";

type AppErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500 | 504;

class AppError extends Error {
  code: BizCodeKey;
  status: AppErrorStatus;
  details?: unknown;

  constructor(
    code: BizCodeKey,
    message: string,
    status: AppErrorStatus,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const app = new Hono<{ Bindings: Bindings }>();

app.onError((error, c) => {
  const meta = createMeta();

  if (error instanceof AppError) {
    const errorMsg = {
      code: error.code,
      message: error.message,
      details: error.details,
    };
    const res = buildFailure(errorMsg, meta);
    return c.json(res, error.status);
  }

  if (error instanceof HTTPException) {
    const errorMsg = {
      code: BizCode.COMMON_INVALID_REQUEST,
      message: error.message,
    };
    const res = buildFailure(errorMsg, meta);
    return c.json(res, error.status);
  }

  console.error(error);

  const errorMsg = {
    code: BizCode.SYSTEM_INTERNAL_ERROR,
    message: "Internal server error",
  };
  const res = buildFailure(errorMsg, meta);
  return c.json(res, 500);
});

app.notFound((c) => {
  const errorMsg = {
    code: BizCode.COMMON_NOT_FOUND,
    message: "Not found",
  };
  const res = buildFailure(errorMsg, createMeta());
  return c.json(res, 404);
});

app.route("/", routes);

export type AppType = typeof routes;

export default app;
