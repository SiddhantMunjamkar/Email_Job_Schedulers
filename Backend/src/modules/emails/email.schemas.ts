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

