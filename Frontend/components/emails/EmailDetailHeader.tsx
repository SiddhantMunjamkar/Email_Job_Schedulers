import { ArrowLeft, Star, Trash2, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/api.server";
import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/auth";
import Image from "next/image";

interface EmailDetailHeaderProps {
  subject: string;
}

export default function EmailDetailHeader({ subject }: EmailDetailHeaderProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  useEffect(() => {
    async function load() {
      const data = await getMe();
      setAvatarUrl(data.user.avatarUrl || "");
    }
    load();
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-4  border-b border-gray-200 rounded-lg  hover:border-gray-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="Star" onClick={() => router.back()}>
          <ArrowLeft className="size-6" />
        </Button>

        <h1 className="text-lg font-semibold text-gray-900">{subject}</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="Star" size="Star">
          <Star className="size-5" />
        </Button>
        <Button variant="Star" size="Star">
          <Archive className="size-5" />
        </Button>
        <Button variant="Star" size="Star">
          <Trash2 className="size-5" />
        </Button>
        <div className="h-8 w-0.5 bg-gray-300 mx-2"></div>
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={24}
            height={24}
            className="h-7 w-7 rounded-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
