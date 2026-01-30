import { Request, Response } from "express";
import { createCampaignAndScheduleEmails } from "./email.service";
import { EmailListItem, listScheduledEmails } from "./email.repo";

export async function getScheduledEmailsController(
  req: Request,
  res: Response,
) {
  const user = req.authUser;
  const { page, limit } = req.query;
  const data = await listScheduledEmails({
    userId: user!.id,
    page: Number(page),
    limit: Number(limit),
  });
  return res.status(200).json({
    page,
    limit,
    total: data.total,
    items: data.items,
  });
}

export async function getSentEmailsController(req: Request, res: Response) {
  const user = req.authUser;
  const { page, limit } = req.query;
  const data = await EmailListItem({
    userId: user!.id,
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json({
    page,
    limit,
    total: data.total,
    items: data.items,
  });
}

export async function scheduleEmailsController(req: Request, res: Response) {
  try {
    const user = req.authUser;
    const {
      senderId,
      subject,
      body,
      recipientEmail,
      startAt,
      delayBetweenseconds,
    } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const campaign = await createCampaignAndScheduleEmails({
      userId: user.id,
      senderId,
      subject,
      body,
      recipientEmail,
      startAt: new Date(startAt),
      delayBetweenseconds,
    });

    return res.status(201).json({
      message: "Emails scheduled",
      campaignId: campaign.id,
      totalEmails: campaign.emailJobs.length,
    });
  } catch (error) {
    console.error("Error in scheduleEmailsController:", error);
    return res.status(500).json({
      message: "Failed to schedule emails",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
