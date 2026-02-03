"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/api.server";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Clock3,
  Send,
  Paperclip,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Sender } from "@/lib/types/sender";
import { Button } from "@/components/ui/button";
import { Input } from "@headlessui/react";
import { DateTimeInput } from "@/components/ui/datetime-Input";

function extractEmails(text: string): string[] {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return Array.from(new Set(matches || []));
}

export default function ComposePage() {
  const router = useRouter();
  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [delayBetweenSeconds, setDelayBetweenSeconds] = useState<number>(2);
  const [hourlyLimit, setHourlyLimit] = useState<number>(200);
  const [startAt, setStartAt] = useState<string>(""); // datetime-local string
  const [showSendLater, setShowSendLater] = useState<boolean>(false);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // tip-tap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    apiFetch<{ items: Sender[] }>("/api/v1/senders")
      .then((res) => {
        setSenders(res.items);
        if (res.items[0]) {
          setSenderId(res.items[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const visibleChips = useMemo(() => {
    recipientEmails.slice(0, 3);
  }, [recipientEmails]);
  const extraCount = Math.max(0, recipientEmails.length - 3);

  function onUploadFileClick() {
    fileRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const emails = extractEmails(text);

    setRecipientEmails(emails);
  }

  async function handleSchedule() {
    if (!senderId) return alert("Please select sender");
    if (!startAt) return alert("Please Select schedule time");
    if (!subject.trim()) return alert(" subject required");
    if (!editor) return alert("Editor  not ready");
    if (recipientEmails.length === 0) return alert("No recipient email");

    const htmlbody = editor.getHTML();
    const plainText = editor.getText();

    setLoading(true);
    try {
      await apiFetch("/api/v1/emails/schedule", {
        method: "POST",
        body: JSON.stringify({
          senderId,
          subject,
          body: plainText,
          recipientEmails,
          startAt: new Date(startAt).toISOString(),
          delayBetweenSeconds,
          hourlyLimit,
        }),
      });
      alert("Email scheduled successfully");
      router.push("/dashboard/scheduled");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full bg-white">
      {/* top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b  border-gray-100">
        <div className="flex items-center gap-1">
          <Button
            variant="backarrow"
            size="backarrow"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-6" />
          </Button>
          <h1 className="text-2xl">Compose New Email</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="upload" size="upload">
            <Paperclip className="size-6 text-green-600" />
          </Button>

          <Button
            variant="upload"
            size="upload"
            onClick={() => setShowSendLater((s) => !s)}
            className={cn(showSendLater ? "bg-gray-100" : "hover:bg-gray-100")}
          >
            <Clock3 className="size-6 text-green-600" />
          </Button>

          <Button
            disabled={loading}
            onClick={handleSchedule}
            variant="Send_later"
            size="send_later"
          >
            Send Later
          </Button>
        </div>
      </div>

      {/*Send Later popover  */}
      {showSendLater && (
        <div className="absolute right-10 top-[90px] z-50 w-[360px] rounded-xl border border-gray-200 bg-white shadow-lg p-5">
          <div className="text-base font-semibold mb-4">Send Later</div>

          {/* Date time input */}
          <div className="relative mb-4">
            <DateTimeInput />
          </div>

          {/* Action buttons */}
        </div>
      )}
    </div>
  );
}
