import { User } from "@/lib/types/auth";
import { ProfileDropdown } from "../profileDropdown";

import Link from "next/link";
import { Button } from "../ui/button";
import SidebarNav from "./sidebarNav";

export default function Sidebar({ id, name, email, avatarUrl }: User) {
  return (
    <div className="flex flex-col bg-white  border-gray-200 w-[260px] h-[900px] opacity-100 pt-3 pr-4 pb-2 pl-2 ">
      {/* Logo */}
      <div className=" mb-4">
        <h1 className="text-4xl font-bold">ONB</h1>
      </div>

      {/* Profile Section */}
      <div className="mb-4">
        <ProfileDropdown
          id={id}
          name={name}
          email={email}
          avatarUrl={avatarUrl}
        />
      </div>

      {/* Compose Button */}
      <div className=" mb-4 ">
        <Link href="/dashboard/compose">
          <Button variant="Compose" size="Compose">
            Compose
          </Button>
        </Link>
      </div>

      {/* Navigation Section */}
      <SidebarNav />
    </div>
  );
}
