import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validateParams, validateQuery } from "../middleware/validateRequest";
import {
  getCampaignDetailsController,
  listCampaignsController,
} from "../modules/campaigns/campaigns.controller";
import { paginationSchema } from "../modules/emails/email.schemas";
import { CampaignSchema } from "../modules/campaigns/campaigns.schemas";

const router = Router();

router.get(
  "/",
  requireAuth,
  validateQuery(paginationSchema),
  listCampaignsController,
);

router.get(
  "/:id",
  requireAuth,
  validateParams(CampaignSchema),
  validateQuery(paginationSchema),
  getCampaignDetailsController,
);

export default router;
