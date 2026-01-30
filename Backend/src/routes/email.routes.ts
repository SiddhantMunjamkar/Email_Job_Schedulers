import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validateQuery, validateRequest } from "../middleware/validateRequest";
import {
  EmailJobSchema,
  paginationSchema,
} from "../modules/emails/email.schemas";
import {
  getScheduledEmailsController,
  scheduleEmailsController,
  getSentEmailsController,
} from "../modules/emails/email.controller";

const router = Router();

router.get(
  "/scheduled",
  requireAuth,
  validateQuery(paginationSchema),
  getScheduledEmailsController,
);

router.get(
  "/sent",
  requireAuth,
  validateQuery(paginationSchema),
  getSentEmailsController,
);

router.post(
  "/schedule-emails",
  requireAuth,
  validateRequest(EmailJobSchema),
  scheduleEmailsController,
);

export default router;
