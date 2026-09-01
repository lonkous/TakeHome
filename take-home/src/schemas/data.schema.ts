import { z } from 'zod';

const coerceDate = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) {
    return new Date(arg);
  } else {
    return arg;
  }
}, z.date());

export const dataSchema = z.object({
  id: z.number(),
  value: z.number(),
});

const responseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
});

export type TResponse = z.infer<typeof responseSchema>;
export type TData = z.infer<typeof dataSchema>;

// Optional: exported for reuse if needed
export { coerceDate };
