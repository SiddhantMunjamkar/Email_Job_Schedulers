"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/api.server";
import { EmailListResponse, EmailItem } from "@/lib/types/email";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

export default function ScheduledPage() {
  const [items, setItems] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<EmailListResponse>(
          "/api/v1/emails/scheduled?page=1&limit=50",
        );

        setItems(data.items);
      } catch (error) {
        console.error("Error fetching scheduled emails:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500">
        <Spinner /> Loading scheduled emails...
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="p-8 text-gray-500">No scheduled emails yet.</div>;
  }

  return (
    <div className="divide-y">
      {items.map((item: EmailItem) => {
        return (
          <Link
            key={item.id || 123}
            href={`/dashboard/scheduled/${item.id}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-100"
          >
            {/* Render your email item here */}
            <div className="w-[220px] text-sm text-gray-700 truncate">
              To: {item.recipientEmail || "No Recipient"}
            </div>

            {/* Render ScheduleAt or Send To */}
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                {new Date(item.ScheduledAt).toLocaleString() || "No Date"}
              </span>

              {/* Render subject body preview */}
              <div className="text-sm font-medium truncate">
                {item.subject || "No Subject"}
                {""}
                <span className="text-gray-400 font-normal">
                  - {item.bodyPreview || "No Preview"}
                </span>
              </div>
            </div>
            <div className="text-gray-400">☆</div>
          </Link>
        );
      })}
    </div>
  );
}
