import { Queue } from "bullmq";
import { bullConnection } from "../config/bullmq";

export const EMAIL_QUEUE_NAME = "email_queue";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: bullConnection,
});
