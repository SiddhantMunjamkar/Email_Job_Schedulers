import { z } from "zod";

export const EmailJobSchema = z.object({
  senderId: z.string(),
  subject: z.string(),
  body: z.string(),
  recipientEmail: z.array(z.string().email().min(1)),

  startAt: z.string().datetime(), // ISO string
  delayBetweenseconds: z.number().int().min(0).max(60),
  hourlylimit: z.number().int().min(1).max(5000),
});

export const EmailJobSchemaWithId = z.object({
  id: z.string().min(1),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      return val ? Number(val) : 1;
    })
    .refine((val) => Number.isInteger(val) && val >= 1, "page  must be be >=1"),

  limit: z
    .string()
    .optional()
    .transform((val) => {
      return val ? Number(val) : 20;
    })
    .refine(
      (val) => Number.isInteger(val) && val >= 1 && val <= 100,
      "limit 1-100",
    ),
});
