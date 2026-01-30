import { Router } from "express";
import { authRouter } from "./auth.routes";
import emailRouter from "./email.routes";
import senderRouter from "./sender.routes";
import campaignRouter from "./campaigns.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/emails", emailRouter);
router.use("/senders", senderRouter);
router.use("/campaigns", campaignRouter);

export default router;
