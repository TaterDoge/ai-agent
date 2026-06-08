import type { ZodError, ZodSchema } from "zod";

export class ValidationError extends Error {
  error: ZodError;

  constructor(error: ZodError) {
    super("Invalid request payload");
    this.error = error;
  }
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
}
