"use client";

import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState, KeyboardEvent } from "react";

interface SendToInputProps {
  recipientEmails: string[];
  onEmailsChange: (emails: string[]) => void;
  onUploadClick: () => void;
}

export default function SendToInput({
  recipientEmails,
  onEmailsChange,
  onUploadClick,
}: SendToInputProps) {
  const [inputValue, setInputValue] = useState("");

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = inputValue.trim();
      if (email && validateEmail(email) && !recipientEmails.includes(email)) {
        onEmailsChange([...recipientEmails, email]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && recipientEmails.length > 0) {
      onEmailsChange(recipientEmails.slice(0, -1));
    }
  };

  const removeEmail = (emailToRemove: string) => {
    onEmailsChange(recipientEmails.filter((email) => email !== emailToRemove));
  };

  const visibleEmails = recipientEmails.slice(0, 3);
  const extraCount = recipientEmails.length - 3;

  return (
    <div className="relative flex items-center gap-3 py-2 after:absolute after:bottom-0 after:left-12 after:right-0 after:h-px after:bg-gray-200">
      <label htmlFor="recipient" className="text-base w-12 flex-none">
        To
      </label>
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {visibleEmails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-green-600 bg-green-50 text-sm text-gray-900"
          >
            {email}
            <button
              type="button"
              onClick={() => removeEmail(email)}
              className="hover:text-green-700"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {extraCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-green-600 bg-green-50 text-sm text-gray-900">
            +{extraCount}
          </span>
        )}
        <Input
          id="recipient"
          type="email"
          placeholder="recipient@example.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0 py-0 h-auto text-sm rounded-none !bg-transparent focus:!bg-transparent hover:!bg-transparent"
        />
      </div>
      <Button
        variant="upload_mail"
        size="upload_mail_list"
        onClick={onUploadClick}
      >
        <Upload className="w-4 h-4" />
        Upload List
      </Button>
    </div>
  );
}
