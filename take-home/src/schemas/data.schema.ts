import { z } from "zod";

export const dataSchema = z.object({
  id: z.number(),
  value: z.number(),
});

export type TData = z.infer<typeof dataSchema>;
