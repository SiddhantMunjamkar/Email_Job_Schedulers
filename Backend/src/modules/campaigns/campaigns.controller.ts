import { Request, Response } from "express";
import { getCampaignDetails, listCampaigns } from "./campaigns.repo";

export async function listCampaignsController(req: Request, res: Response) {
  const user = req.authUser;
  const { page, limit } = req.query;

  const data = await listCampaigns({
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

export async function getCampaignDetailsController(
  req: Request,
  res: Response,
) {
  const user = req.authUser;
  const { id } = req.params as any;
  const { page, limit } = req.query as any;

  const result = await getCampaignDetails({
    userId: user!.id,
    campaignId: id,
    page,
    limit,
  });

  if (!result) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  return res.status(200).json(result);
}
