export type EmailListItem = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  campaignId: string;
  senderId: string;
};
