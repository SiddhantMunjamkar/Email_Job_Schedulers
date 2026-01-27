import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validateRequest } from "../middleware/validateRequest";
import { EmailJobSchema } from "../modules/emails/email.schemas";
import { scheduleEmailsController } from "../modules/emails/email.controller";

const router = Router();

router.post(
  "/schedule-emails",
  requireAuth,
  validateRequest(EmailJobSchema),
  scheduleEmailsController,
);

export default router;
