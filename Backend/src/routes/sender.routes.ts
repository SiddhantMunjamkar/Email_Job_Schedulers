import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validateRequest } from "../middleware/validateRequest";
import { createSenderSchema } from "../modules/senders/sender.schemas";
import {
  createSenderController,
  listSendersController,
} from "../modules/senders/sender.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateRequest(createSenderSchema),
  createSenderController,
);

router.get("/", requireAuth, listSendersController);

export default router;
