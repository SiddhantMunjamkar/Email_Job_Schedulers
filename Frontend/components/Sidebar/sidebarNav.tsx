"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { sidebarNavItems } from "./siderbarNavItems";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/api.server";

interface EmailStats {
  scheduledCount: number;
  sentCount: number;
}

export default function SidebarNav() {
  const pathname = usePathname();
  const [stats, setStats] = useState<EmailStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await apiFetch<EmailStats>("/api/v1/emails/count/stats");
        setStats(data);
      } catch (error) {
        console.error("Error fetching email stats:", error);
      }
    }
    fetchStats();
  }, [pathname]);

  return (
    <nav className="flex flex-col gap-1">
      {/* Section Label */}
      <div className="mb-2">
        <span className="text-xs text-gray-400 font-medium tracking-wider">
          CORE
        </span>
      </div>
      {/* Navigation Items */}
      {sidebarNavItems.map((item) => {
        const isActive = pathname === item.href;
        const count = stats ? stats[item.countKey] : undefined;
        return (
          <NavItem
            href={item.href}
            icon={item.icon}
            label={item.label}
            count={count}
            key={item.id}
            active={isActive}
          />
        );
      })}
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  count,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ",
        active ? "bg-green-50 " : "hover:bg-gray-50",
      )}
    >
      <div className="flex items-center gap-3 ">
        {/* Icon */}
        <Icon
          className={cn("w-5 h-5 ", active ? "text-gray-700" : "text-gray-400")}
        />
        {/* Label */}
        <span
          className={cn(
            "text-sm",
            active
              ? " font-semibold text-gray-900"
              : "font-medium text-gray-500",
          )}
        >
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500 font-medium">{count}</span>
      )}
    </Link>
  );
}
