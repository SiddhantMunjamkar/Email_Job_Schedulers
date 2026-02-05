import { Input } from "@/components/ui/input";

interface subjectInputProps {
  subject: string;
  setSubject: (subject: string) => void;
}

export default function SubjectInput({
  subject,
  setSubject,
}: subjectInputProps) {
  return (
    <div className="px-6 py-2">
      <div className="relative flex items-center gap-3 py-2 after:absolute after:bottom-0 after:left-12 after:right-0 after:h-px after:bg-gray-200">
        <label className="text-base w-13">Subject</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="flex-1 border-0 text-sm outline-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !bg-transparent focus:!bg-transparent hover:!bg-transparent"
        />
      </div>
    </div>
  );
}
