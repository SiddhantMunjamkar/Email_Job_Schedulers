"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/api.server";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bold,
  Upload,
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
import { DateTimeInput } from "@/components/ui/Sendlater-datetime";
import { Select } from "@/components/ui/select";
import { Sen } from "next/font/google";
import SendToInput from "@/components/Compose/SendToInput";

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
    return recipientEmails.slice(0, 3);
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
      <div className="flex items-center justify-between px-4 py-4 border-b  border-gray-100">
        <div className="flex items-center ">
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
            <DateTimeInput
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="Cancel"
              size="Cancel"
              onClick={() => setShowSendLater(false)}
            >
              Cancel
            </Button>
            <Button
              variant="Done"
              size="Done"
              onClick={() => setShowSendLater(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Form area */}
      <div className="py-4 space-y-3 px-45">
        {/* From */}
        <div className="flex items-center gap-3 px-6 py-2">
          <label className="text-sm  w-12">From</label>
          <select
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="text-sm text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-5 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M10.293%203.293%206%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_3px_center] bg-no-repeat border-none"
          >
            {senders.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fromEmail}
              </option>
            ))}
          </select>
        </div>

        {/* To */}
        <div className="px-6">
          <SendToInput />
        </div>

        {/* Subject */}
        <div className="px-6 py-2">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
            <label className="text-sm  w-12">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 border-0 text-sm outline-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
          </div>
        </div>

        {/* Editor */}
        <div className="px-6 pt-2">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
