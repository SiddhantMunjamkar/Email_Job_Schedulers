export type EmailItem = {
  id: string;
  recipientEmail: string;
  subject: string;
  status: "SENT" | "PENDING" | "FAILED";
  ScheduledAt: string;
  sentAt: string | null;
};

export type EmailListResponse = {
  page: number;
  limit: number;
  total: number;
  items: EmailItem[];
};
