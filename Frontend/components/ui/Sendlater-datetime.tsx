import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export function DateTimeInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    inputRef.current?.showPicker();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="datetime-local"
        {...props}
        className={cn(
          "w-full border-b border-gray-200 bg-transparent px-0 py-3 text-base text-gray-400 outline-none focus:border-gray-300 pr-10",
          "placeholder:text-gray-400",
          "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden",
          
          className,
        )}
      />
      <Calendar 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 stroke-[1.5] cursor-pointer" 
        onClick={handleCalendarClick}
      />
    </div>
  );
}





