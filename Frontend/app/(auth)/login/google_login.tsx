"use client";

import { Button } from "@/components/ui/button";
import { googleLogin } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

export function GoogleLogin() {
  return (
    <div>
      <Button
        variant="custom_Google"
        size="custom_Google"
        onClick={() => googleLogin()}
      >
        <FcGoogle className="size-6 " />{" "}
        <span className="font-medium">Login with Google</span>
      </Button>
    </div>
  );
}
