import type { BizCodeKey } from "./biz-code";

export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export interface ApiSuccess<T> {
  data: T;
  meta: ApiMeta;
  ok: true;
}

export interface ApiError<E = unknown> {
  code: BizCodeKey;
  details?: E;
  message: string;
}

export interface ApiFailure<E = unknown> {
  error: ApiError<E>;
  meta: ApiMeta;
  ok: false;
}

export type ApiResponse<T, E = unknown> = ApiSuccess<T> | ApiFailure<E>;

export function buildSuccess<T>(data: T, meta: ApiMeta): ApiSuccess<T> {
  return { ok: true, data, meta };
}

export function buildFailure<E = unknown>(
  error: ApiError<E>,
  meta: ApiMeta
): ApiFailure<E> {
  return { ok: false, error, meta };
}
