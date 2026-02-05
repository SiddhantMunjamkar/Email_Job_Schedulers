"use client";

import { apiFetch } from "@/lib/api/api.server";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { EmailDetailResponse } from "@/lib/types/email";
import { Separator } from "@/components/ui/separator";
import EmailDetailHeader from "@/components/emails/EmailDetailHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<EmailDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const detailData = await apiFetch<EmailDetailResponse>(
          `/api/v1/emails/${id}`,
        );
        setData(detailData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center text-center min-h-screen justify-center  gap-2 text-sm text-gray-500">
        <Spinner /> Loading email…
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-sm text-gray-500">Email not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <EmailDetailHeader subject={data.subject || "No Subject"} />

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto  py-6">
        {/* SENDER ROW */}
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar size="lg">
            <AvatarFallback className="bg-green-600 text-white font-semibold">
              {data.senderEmail.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-900">
                  <span className=" font-bold">{data.senderName}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    &lt;{data.senderEmail}&gt;
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  To: {data.recipientEmail || "—"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {new Date(data.ScheduledAt).toLocaleString()}
                </p>
                <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                  {data.status}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* EMAIL BODY */}
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {data.bodyPreview || "No content"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
