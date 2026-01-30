import { prisma } from "../config/prisma";
import { scheduleEmailJob } from "./schedulerEmailJob";
import { emailQueue } from "../queue/email.queue";

export async function reconciliationOnStartup() {
  console.log("Starting reconciliation of email jobs on startup...");

  const now = new Date();

  // get all jobs that are due to be sent to queue
  const ScheduledJobs = await prisma.emailJob.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gt: now },
    },
    select: {
      id: true,
      scheduledAt: true,
      bullmqJobId: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
    take: 500,
  });

  let requeued = 0;
  let alreadyok = 0;

  for (const job of ScheduledJobs) {
    const bullJob = await emailQueue.getJob(job.id);

    if (bullJob) {
      alreadyok++;
      continue;
    }

    const newBullId = await scheduleEmailJob({
      emailJobId: job.id,
      scheduleAt: job.scheduledAt,
    });

    await prisma.emailJob.update({
      where: { id: job.id },
      data: { bullmqJobId: newBullId },
    });
    requeued++;
  }
  console.log(
    `Reconciliation complete. Requeued: ${requeued}, Already OK: ${alreadyok}`,
  );
}
