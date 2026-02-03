"use client";

import { apiFetch } from "@/lib/api/api.server";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { EmailDetailResponse } from "@/lib/types/email";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ScheduledDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;
  const [data, setData] = useState<EmailDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const detailData = await apiFetch<EmailDetailResponse>(
          `/api/v1/emails/${id}`,
        );
        setData(detailData);
      } catch (error) {
        console.error("Error fetching email detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500">
        <Spinner /> Loading email detail...
      </div>
    );
  }
  if (!data) {
    return <div className="p-8 text-sm  text-gray-500">Email not found.</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b  pb-4">
        <div className="flex items-center gap-3">
          <Button onClick={() => router.back()}>
            <MoveLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg  font-semibold">{data.subject}</h1>
          <div className="flex items-center gap-3 bg-gray-500">
            <button>☆</button>
            <button>🗑️</button>
          </div>
        </div>

        {/* Body */}
        <div className="mt-6 flex gap-4">
          {/* sender Avatar */}
          <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
            {data.senderEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">To: {data.senderName}</p>
                <p className="text-sm text-gray-500">
                  &lt;{data.senderEmail}&gt;
                </p>
                <p className="text-sm text-gray-500">
                  TO: {data.recipientEmail}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {new Date(data.ScheduledAt).toLocaleString()}
                </p>
                <p className="text-xs text-orange-700 bg-orange-100 px-2 py-1  rounded-full inline-block mt-2">
                  {data.status}
                </p>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-800 whitespace-pre-line">
              {data.bodyPreview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
