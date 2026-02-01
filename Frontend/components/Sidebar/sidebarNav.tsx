"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { sidebarNavItems } from "./siderbarNavItems";
import { usePathname } from "next/navigation";

export default function SidebarNav() {
  const pathname = usePathname();
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
        return (
          <NavItem
            href={item.href}
            icon={item.icon}
            label={item.label}
            count={item.count}
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
  icon,
  label,
  count,
  active,
}: {
  href: string;
  icon: React.ReactNode;
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
        <span>{icon}</span>
        {/* Label */}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500 font-medium">{count}</span>
      )}
    </Link>
  );
}
