import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  validateParams,
  validateQuery,
  validateRequest,
} from "../middleware/validateRequest";
import {
  EmailJobSchema,
  EmailJobSchemaWithId,
  paginationSchema,
} from "../modules/emails/email.schemas";
import {
  getScheduledEmailsController,
  scheduleEmailsController,
  getSentEmailsController,
  getEmailByIdController,
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

router.get(
  "/:id",
  requireAuth,
  validateParams(EmailJobSchemaWithId),
  getEmailByIdController,
);

export default router;
