import { prisma } from "../config/prisma";
import { createEtherealTransporter } from "../services/mailer/mailer.service";

const transpoterPromise = createEtherealTransporter();

export async function processEmailJob(emailJobId: string) {
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
  } catch (error) {
    console.error(`Error processing email job ${emailJobId}:`, error);
    
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: "FAILED",
        lastError: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error; // Re-throw so BullMQ knows the job failed and can retry
  }
}
