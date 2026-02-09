import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const optionalHttpsUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .url()
    .regex(/^https:\/\//, { message: "https URLのみ許可" })
    .optional(),
);

export const StoreInputSchema = z.object({
  storeName: z.string().min(1),
  branchName: optionalText,
  prefecture: z.string().min(1),
  area: optionalText,
  category: z.string().min(1),
  genre: optionalText,
  businessHours: z
    .object({
      open: z.string().min(1),
      close: optionalText,
    })
    .optional(),
  castBack: z.coerce.number().min(0).optional(),
  phoneNumber: optionalText,
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().email().optional(),
  ),
  lineUrl: optionalHttpsUrl,
  twitterUrl: optionalHttpsUrl,
  bskyUrl: optionalHttpsUrl,
  womenRecruitmentPageMissing: z.boolean().optional(),
  recruitmentUrls: z
    .array(z.string().url().regex(/^https:\/\//, { message: "https URLのみ許可" }))
    .optional()
    .default([]),
});

export type StoreInput = z.infer<typeof StoreInputSchema>;
