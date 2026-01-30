import { prisma } from "../config/prisma";
import { rescheduleToNextWindow } from "../scheduler/rescheduleToNextWindow";
import {
  acquireEmailSendLock,
  releaseEmailsendLock,
} from "../services/idempotency/idempotency.service";
import { createEtherealTransporter } from "../services/mailer/mailer.service";
import { tryConsumeSendHourlyQuota } from "../services/rateLimit/rate.Limit.service";
import { sleep } from "../services/time/sleep";
import { getHourWindowKey } from "../services/time/timewindow.service";

const transpoterPromise = createEtherealTransporter();

export async function processEmailJob(emailJobId: string) {
  const lock = await acquireEmailSendLock({
    emailJobId,
    ttlSeconds: 60 * 5, // 5 minutes
  });

  if (!lock.acquired) {
    console.log(`Email job ${emailJobId} is already being sent`);
    return;
  }

  try {
    const job = await prisma.emailJob.findUnique({
      where: { id: emailJobId },
      include: {
        campaign: {
          include: { sender: true },
        },
      },
    });

    if (!job) {
      throw new Error(`Email job ${emailJobId} not found`);
    }

    // idempotency check : if send do nothing
    if (job.status === "SENT") {
      return;
    }

    const limitperhour = process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || 100;

    // Rate limiting check before (atomic + shared across workers)
    const hourkey = getHourWindowKey(new Date());
    const allowed = await tryConsumeSendHourlyQuota({
      senderId: job.campaign.senderId,
      hourkey: hourkey,
      limitPerHour: Number(limitperhour),
    });

    if (!allowed.allowed) {
      //  adding to next time window
      await rescheduleToNextWindow(emailJobId);
      return;
    }

    // Mark sending
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: "SENDING" },
    });

    const transpoter = await transpoterPromise;

    await transpoter.sendMail({
      from: `"${job.campaign.sender.name}" <${job.campaign.sender.fromemail}>`,
      to: job.recipient,
      subject: job.campaign.subject,
      text: job.campaign.body,
    });

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: "SENT", sentAt: new Date(), lastError: null },
    });

    const minDelaySeconds = Number(
      process.env.MIN_DELAY_BETWEEN_EMAILS_SECONDS || 2,
    );

    if (minDelaySeconds > 0) {
      await sleep(minDelaySeconds * 1000);
    }
  } catch (error) {
    console.error(`Error processing email job ${emailJobId}:`, error);

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: "SCHEDULED", // reset to scheduled for retry
        lastError: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error; // Re-throw so BullMQ knows the job failed and can retry
  } finally {
    await releaseEmailsendLock(lock.key);
  }
}
