import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export function AuthInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      {...props}
      className={cn(
        "h-12 rounded-md bg-gray-100 border-none  px-6 text-base",
        "placeholder:text-gray-500",
        "focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:border-transparent",
        className,
      )}
    />
  );
}
