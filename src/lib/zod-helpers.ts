import { z } from "zod";

/**
 * Generic Zod helpers. Not wired to any DaVinci-specific schema today.
 */

export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
}

export const nonEmptyString = z.string().trim().min(1);
export const isoDateString = z.string().datetime();
export const e164Phone = z.string().regex(/^\+[1-9]\d{6,14}$/, "Expected E.164 phone number");
