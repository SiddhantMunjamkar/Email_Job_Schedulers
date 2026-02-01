import { Clock, Send } from "lucide-react";

export const sidebarNavItems = [
  {
    id: 1,
    label: "Scheduled",
    icon: Clock,
    href: "/dashboard/scheduled",
    count: 12,
  },
  {
    id: 2,
    label: "Sent",
    icon: Send ,
    href: "/dashboard/sent",
    count: 785,
  },
];
