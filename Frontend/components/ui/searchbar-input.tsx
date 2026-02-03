import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export function SearchbarInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        {...props}
        className={cn(
          "h-10 w-full rounded-full bg-gray-100 border-none pl-11 pr-6 text-base",
          "placeholder:text-gray-400",
          "focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:border-transparent",
          className,
        )}
      />
    </div>
  );
}
