import { prisma } from "../../config/prisma";

export async function listCampaigns(params: {
  userId: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: params.limit,
      select: {
        id: true,
        subject: true,
        body: true,
        startAt: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            fromemail: true,
          },
        },
        _count: {
          select: {
            emailJobs: true,
          },
        },
      },
    }),

    prisma.campaign.count({
      where: { userId: params.userId },
    }),
  ]);

  return {
    items: items.map((c) => {
      return {
        id: c.id,
        subject: c.subject,
        body: c.body.slice(0, 120), // avoid sending large data in list
        startAt: c.startAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        sender: c.sender,
        totalEmails: c._count.emailJobs,
      };
    }),
    total,
  };
}

export async function getCampaignDetails(params: {
  userId: string;
  campaignId: string;
  page: number;
  limit: number;
}) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.campaignId,
      userId: params.userId,
    },
    select: {
      id: true,
      subject: true,
      body: true,
      startAt: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          fromemail: true,
        },
      },
    },
  });
  if (!campaign) {
    return null;
  }

  const statusCountRaw = await prisma.emailJob.groupBy({
    by: ["status"],
    where: {
      campaignId: params.campaignId,
    },
    _count: { _all: true },
  });

  const counts = {
    SCHEDULED: 0,
    SENDING: 0,
    SENT: 0,
    FAILED: 0,
  };

  for (const row of statusCountRaw) {
    counts[row.status] = row._count._all;
  }

  // list email jobs with pagination
  const skip = (params.page - 1) * params.limit;

  const [jobs, totalJobs] = await Promise.all([
    prisma.emailJob.findMany({
      where: {
        campaignId: params.campaignId,
      },
      orderBy: {
        scheduledAt: "asc",
      },
      skip,
      take: params.limit,
      select: {
        id: true,
        recipient: true,
        status: true,
        scheduledAt: true,
        sentAt: true,
        lastError: true,
        createdAt: true,
      },
    }),

    prisma.emailJob.count({
      where: {
        campaignId: params.campaignId,
      },
    }),
  ]);

  return {
    campaign: {
      id: campaign.id,
      subject: campaign.subject,
      body: campaign.body,
      startAt: campaign.startAt.toISOString(),
      createdAt: campaign.createdAt.toISOString(),
      sender: campaign.sender,
    },
    stats: {
      ...counts,
    },
    emailJobs: {
      page: params.page,
      limit: params.limit,
      total: totalJobs,
      items: jobs.map((job) => {
        return {
          id: job.id,
          recipient: job.recipient,
          status: job.status,
          scheduledAt: job.scheduledAt.toISOString(),
          sentAt: job.sentAt ? job.sentAt.toISOString() : null,
          lastError: job.lastError,
          createdAt: job.createdAt.toISOString(),
        };
      }),
    },
  };
}
