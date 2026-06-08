import type { BizCodeKey } from "@repo/contracts";

export type AppErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500 | 504;

export class AppError extends Error {
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
