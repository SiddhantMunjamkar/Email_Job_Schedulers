"use client";

import { User } from "@/lib/types/auth";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { Logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function ProfileDropdown({ name, email, avatarUrl }: User) {
  const router = useRouter();
  return (
    <Menu as="div" className="relative ">
      {/* Button */}
      <Menu.Button className="flex items-center gap-3 w-full rounded-lg px-2 py-2 bg-gray-100 hover:bg-gray-200 transition-colors">
        {/* Avatar */}
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        )}
        {!avatarUrl && (
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
        {/* Name + Email */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {name || "User"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {email || "No email"}
          </p>
        </div>
        {/* Chevron */}
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </Menu.Button>

      {/* Dropdown items */}
      <Menu.Items className="absolute left-0 right-0 mt-2 origin-top rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
        <div className="p-1">
          <Menu.Item>
            {({ active }) => (
              <Button
                variant="logout"
                className={cn(active ? "bg-gray-100" : "")}
                onClick={async () => {
                  await Logout();
                  router.push("/login");
                }}
              >
                Logout
              </Button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
