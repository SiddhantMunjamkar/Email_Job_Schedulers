import { prisma } from "../../config/prisma";

export async function listScheduledEmails(params: {
  userId: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    prisma.emailJob.findMany({
      where: {
        campaign: { userId: params.userId },
        status: { in: ["SCHEDULED", "SENDING"] },
      },
      orderBy: { scheduledAt: "asc" },
      skip,
      take: params.limit,
      select: {
        id: true,
        recipient: true,
        status: true,
        scheduledAt: true,
        sentAt: true,
        campaignId: true,
        campaign: {
          select: {
            subject: true,
            senderId: true,
          },
        },
      },
    }),

    prisma.emailJob.count({
      where: {
        campaign: { userId: params.userId },
        status: { in: ["SCHEDULED", "SENDING"] },
      },
    }),
  ]);

  return {
    items: items.map((items) => {
      return {
        id: items.id,
        recipient: items.recipient,
        subject: items.campaign.subject,
        status: items.status,
        scheduledAt: items.scheduledAt.toISOString(),
        sentAt: items.sentAt ? items.sentAt.toISOString() : null,
        campaignId: items.campaignId,
        senderId: items.campaign.senderId,
      };
    }),
    total,
  };
}

export async function EmailListItem(params: {
  userId: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    prisma.emailJob.findMany({
      where: {
        campaign: { userId: params.userId },
        status: { in: ["SCHEDULED", "SENT"] },
      },
      orderBy: { scheduledAt: "asc" },
      skip,
      take: params.limit,
      select: {
        id: true,
        recipient: true,
        status: true,
        scheduledAt: true,
        sentAt: true,
        campaignId: true,
        campaign: {
          select: {
            subject: true,
            senderId: true,
          },
        },
      },
    }),
    await prisma.emailJob.count({
      where: {
        campaign: { userId: params.userId },
        status: { in: ["SCHEDULED", "SENT"] },
      },
    }),
  ]);

  return {
    items: items.map((itmes) => {
      return {
        id: itmes.id,
        recipient: itmes.recipient,
        subject: itmes.campaign.subject,
        status: itmes.status,
        scheduledAt: itmes.scheduledAt.toISOString(),
        sentAt: itmes.sentAt ? itmes.sentAt.toISOString() : null,
        campaignId: itmes.campaignId,
        senderId: itmes.campaign.senderId,
      };
    }),
    total,
  };
}
