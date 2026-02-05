import { Input } from "@/components/ui/input";

interface DelayEmailsProps {
  value: number;
  onChange: (value: number) => void;
}

export default function Delay_emails({ value, onChange }: DelayEmailsProps) {
  return (
    <div className="px-6 ">
      <div className="relative flex items-center gap-3 py-2 after:absolute after:bottom-0 after:left-12 after:right-0  after:bg-gray-200">
        <label className="text-base font-normal text-gray-900">
          Delay between 2 emails
        </label>
        <Input
          type="number"
          min="00"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="00"
          className="w-18 h-10 text-center text-lg border-gray-200 rounded-lg  hover:border-gray-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}
