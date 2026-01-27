import { scheduleEmailJob } from "../../scheduler/schedulerEmailJob";
import { prisma } from "../../config/prisma";

export async function createCampaignAndScheduleEmails(params: {
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  recipientEmail: string[];
  startAt: Date;
  delayBetweenseconds: number;
}) {
  // sender belong to user
  const sender = await prisma.sender.findFirst({
    where: {
      id: params.senderId,
      userId: params.userId,
    },
  });

  if (!sender) {
    throw new Error("Sender not found");
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: params.userId,
      senderId: params.senderId,
      subject: params.subject,
      body: params.body,
      startAt: params.startAt,
      emailJobs: {
        create: params.recipientEmail.map((email, index) => ({
          recipient: email,
          scheduledAt: new Date(
            params.startAt.getTime() +
              index * params.delayBetweenseconds * 1000,
          ),
        })),
      },
    },
    include: {
      emailJobs: true,
    },
  });

  // schedule jobs
  for (const emailJob of campaign.emailJobs) {
    const bullId = await scheduleEmailJob({
      emailJobId: emailJob.id,
      scheduleAt: emailJob.scheduledAt,
    });

    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: { bullmqJobId: bullId },
    });
  }
  return campaign;
}
