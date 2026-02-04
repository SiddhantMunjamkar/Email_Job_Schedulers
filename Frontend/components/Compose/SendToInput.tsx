"use client";

import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";


export default function SendToInput() {
  return (
    <div className="relative flex items-center gap-3 py-2 after:absolute after:bottom-0 after:left-12 after:right-0 after:h-px after:bg-gray-200">
      <label htmlFor="recipient" className="text-sm w-12 flex-none">
        To
      </label>
      <Input
        id="recipient"
        type="email"
        placeholder="recipient@example.com"
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0 py-0 h-auto text-sm rounded-none bg-transparent"
      />
      <Button
        variant="upload_mail"
        size="upload_mail_list"
        onClick={onUploadFileClick}
      >
        <Upload className="w-4 h-4" />
        Upload List
      </Button>
    </div>
  );
}
