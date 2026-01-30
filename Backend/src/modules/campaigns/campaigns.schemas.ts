import { z } from "zod";

export const CampaignSchema = z.object({
  id: z.string().min(1),
});
