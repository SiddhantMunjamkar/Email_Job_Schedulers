import { emailQueue } from "../queue/email.queue";
import { getNextHourStart } from "../services/time/timewindow.service";

export async function rescheduleToNextWindow(emailJobId: string) {
  const next = getNextHourStart(new Date());
  const delayMs = Math.max(0, next.getTime() - Date.now());

  emailQueue.add(
    "send-email",
    { emailJobId },
    {
      delay: delayMs,
      jobId: emailJobId,
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );
  return next;
}
