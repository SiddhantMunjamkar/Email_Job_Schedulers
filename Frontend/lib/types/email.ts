export type EmailItem = {
  id: string;
  recipientEmail: string;
  subject: string;
  bodyPreview: string;
  status: "SENT" | "SCHEDULED" | "DRAFT";
  ScheduledAt: string;
  sentAt: string | null;
};

export type EmailListResponse = {
  page: number;
  limit: number;
  total: number;
  items: EmailItem[];
};

export type EmailDetailResponse = EmailItem & {
  senderName: string;
  senderEmail: string;
};

