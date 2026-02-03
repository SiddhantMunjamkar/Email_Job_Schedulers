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
            body: true,
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
        bodyPreview: items.campaign.body.slice(0, 60),
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

export async function getEmailById(params: {
  emailId: string;
  userId: string;
}) {
  const email = await prisma.emailJob.findFirst({
    where: {
      id: params.emailId,
      campaign: { userId: params.userId },
    },
    select: {
      id: true,
      recipient: true,
      status: true,
      scheduledAt: true,
      sentAt: true,
      lastError: true,
      campaign: {
        select: {
          subject: true,
          body: true,
          sender: {
            select: {
              name: true,
              fromemail: true,
            },
          },
        },
      },
    },
  });

  if (!email) {
    return null;
  }

  return {
    id: email.id,
    recipient: email.recipient,
    subject: email.campaign.subject,
    body: email.campaign.body,
    status: email.status,
    scheduledAt: email.scheduledAt.toISOString(),
    sentAt: email.sentAt ? email.sentAt.toISOString() : null,
    lastError: email.lastError,
    senderName: email.campaign.sender.name,
    senderEmail: email.campaign.sender.fromemail,
  };
}
