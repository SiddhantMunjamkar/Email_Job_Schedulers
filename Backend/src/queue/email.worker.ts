import { Worker } from "bullmq";
import { EMAIL_QUEUE_NAME } from "./email.queue";
import { bullConnection } from "../config/bullmq";
import { processEmailJob } from "./email.processor";
import { SendEmailJobData } from "./job.types";
import { prisma } from "../config/prisma";

export function startEmailWorker() {
  const concurrency = Number(process.env.WORKER_CONCURRENCY) || 5;

  const worker = new Worker<SendEmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      await processEmailJob(job.data.emailJobId);
    },
    {
      connection: bullConnection,
      concurrency,
    },
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;

    const attempt = job.opts.attempts ?? 1;
    const attempnumber = job.attemptsMade + 1;
    const isFinalAttempt = attempnumber >= attempt;

    if (isFinalAttempt) {
      // Only update if the job exists in the database
      const emailJob = await prisma.emailJob.findUnique({
        where: { id: job.data.emailJobId },
        select: { id: true },
      });

      if (emailJob) {
        await prisma.emailJob.update({
          where: { id: job.data.emailJobId },
          data: { status: "FAILED", lastError: err.message },
        });
      } else {
        console.warn(
          `Email job ${job.data.emailJobId} not found in database during failure handling`,
        );
      }
    }
  });

  return worker;
}
