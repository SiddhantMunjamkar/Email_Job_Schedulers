import { Clock, Send } from "lucide-react";
 

export const sidebarNavItems = [
  {
    id: 1,
    label: "Scheduled",
    icon: Clock,
    href: "/dashboard/scheduled",
    countKey: "scheduledCount" as const,
  },
  {
    id: 2,
    label: "Sent",
    icon: Send ,
    href: "/dashboard/sent",
    countKey: "sentCount" as const,
  },
];
