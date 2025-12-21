import { z } from "zod";

export const StoreInputSchema = z.object({
  storeName: z.string().min(1),
  branchName: z.string().optional(),
  prefecture: z.string().min(1),
  area: z.string().optional(),
  category: z.string().min(1),
  genre: z.string().optional(),
  businessHours: z
    .object({
      open: z.string().min(1),
      close: z.string().min(1),
    })
    .optional(),
  castBack: z.coerce.number().min(0).optional(),
  recruitmentUrls: z
    .array(z.string().url().regex(/^https:\/\//, { message: "https URLのみ許可" }))
    .optional()
    .default([]),
});

export type StoreInput = z.infer<typeof StoreInputSchema>;
