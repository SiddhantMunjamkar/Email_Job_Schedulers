import { emailQueue } from "../queue/email.queue";
import { SendEmailJobData } from "../queue/job.types";

export async function scheduleEmailJob(params: {
  emailJobId: string;
  scheduleAt: Date;
}) {
  const delayMs = Math.max(0, params.scheduleAt.getTime() - Date.now());

  // jobid ensures bullmq idempotency
  const job = await emailQueue.add(
    "send-email",
    { emailJobId: params.emailJobId } satisfies SendEmailJobData,
    {
      delay: delayMs,
      jobId: params.emailJobId,
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  );

  return job.id;
}
