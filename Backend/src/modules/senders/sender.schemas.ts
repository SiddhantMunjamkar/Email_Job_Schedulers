import { z } from "zod";


export const createSenderSchema = z.object({
  name: z.string().min(2).max(50),
  fromEmail: z.string().email(),
});
