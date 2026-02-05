"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sender } from "@/lib/types/sender";

interface FromEmailProps {
  senderId: string;
  setSenderId: (id: string) => void;
  senders: Sender[];
}

export default function FromEmail({
  senderId,
  setSenderId,
  senders,
}: FromEmailProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-2">
      <label className="w-12 text-base text-gray-700">From</label>

      <Select value={senderId} onValueChange={setSenderId}>
        <SelectTrigger className="h-8 w-fit min-w-[220px] border-0 bg-transparent p-0 text-sm text-gray-900 shadow-none focus:ring-0 px-2">
          <SelectValue placeholder="Select sender" />
        </SelectTrigger>

        <SelectContent align="start">
          {senders.map((sender) => (
            <SelectItem key={sender.id} value={sender.id}>
              {sender.fromemail}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
