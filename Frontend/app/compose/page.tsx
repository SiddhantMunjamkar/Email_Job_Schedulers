"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/api.server";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock3, Paperclip } from "lucide-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import { Sender } from "@/lib/types/sender";
import { Button } from "@/components/ui/button";
import { DateTimeInput } from "@/components/Compose/Sendlater-datetime";
import SendToInput from "@/components/Compose/SendToInput";
import SubjectInput from "@/components/Compose/SubjectInput";
import Delay_emails from "@/components/Compose/Delay-emails";
import Hourlylimit from "@/components/Compose/Hourlylimilt";
import BodyEditor from "@/components/Compose/BodyEditor";
import { Placeholder } from "@tiptap/extensions";
import FromEmail from "@/components/Compose/FromEmail";
import { extractEmailsFromFile } from "@/lib/utils/emailsFileParser";



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
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Type your reply...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none prose prose-sm max-w-none",
      },
    },
    immediatelyRender: false,
  });

  const canSchedule =
    !!senderId &&
    !!startAt &&
    subject.trim().length > 0 &&
    !!editor &&
    recipientEmails.length > 0;

  useEffect(() => {
    console.log("Fetching senders...");
    apiFetch<{ items: Sender[] }>("/api/v1/senders")
      .then((res) => {
        console.log("API Response:", res);
        const normalized = res.items.map((s) => ({
          id: s.id,
          name: s.name,
          fromemail: s.fromemail,
        }));

        console.log("Normalized senders:", normalized);
        setSenders(normalized);

        if (normalized[0]) {
          setSenderId(normalized[0].id);
        }
      })
      .catch((error) => {
        console.error("Error fetching senders:", error);
      });
  }, []);

  function onUploadFileClick() {
    if( fileRef.current){
      fileRef.current.value = ""; 
       fileRef.current?.click();

    }
   
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const emails = await extractEmailsFromFile(file);

    if (emails.length === 0) {
      alert("No vaild email addresses found in file");
      return;
    }

    setRecipientEmails((prev) => {
      const combined = new Set([...prev, ...emails]);
      return Array.from(combined);
    });
  }

  async function handleSchedule() {
    if (!senderId) return alert("Please select sender");
    if (!startAt) return alert("Please Select schedule time");
    if (!subject.trim()) return alert(" subject required");
    if (!editor) return alert("Editor  not ready");
    if (recipientEmails.length === 0) return alert("No recipient email");

    // const htmlbody = editor.getHTML();
    const plainText = editor.getText();

    
    setLoading(true);
    try {
      await apiFetch("/api/v1/emails/schedule-emails", {
        method: "POST",
        body: JSON.stringify({
          senderId,
          subject,
          body: plainText,
          recipientEmail: recipientEmails,
          startAt: new Date(startAt).toISOString(),
          delayBetweenseconds: delayBetweenSeconds,
          hourlylimit: hourlyLimit,
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
        <div className="flex items-center gap-3 ">
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
            <Clock3
              className={cn(
                startAt ? "size-6 text-green-600" : "size-6 text-gray-500",
              )}
            />
          </Button>

          <Button
            disabled={loading}
            onClick={handleSchedule}
            variant="Send_later"
            size="send_later"
            className={cn(
              !canSchedule && "opacity-50 cursor-not-allowed",
              canSchedule && "hover:bg-green-50 ",
            )}
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
        <FromEmail
          senderId={senderId}
          setSenderId={setSenderId}
          senders={senders}
        />

        {/* To */}
        <div className="px-6">
          <SendToInput
            recipientEmails={recipientEmails}
            onEmailsChange={setRecipientEmails}
            onUploadClick={onUploadFileClick}
          />
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Subject */}
        <SubjectInput subject={subject} setSubject={setSubject} />

        {/* Delay between emails */}
        <div className=" flex ">
          <Delay_emails
            value={delayBetweenSeconds}
            onChange={setDelayBetweenSeconds}
          />
          <Hourlylimit value={hourlyLimit} onChange={setHourlyLimit} />
        </div>

        {/* Editor */}
        <div className="px-6 pt-2">
          <BodyEditor editor={editor} />
        </div>
      </div>
    </div>
  );
}
