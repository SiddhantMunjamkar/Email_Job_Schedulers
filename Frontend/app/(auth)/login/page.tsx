"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  return (
    <div className=" min-h-screen flex items-center justify-center bg-white ">
      <div className="w-[420px] rounded-xl border border-gray-200 bg-white  p-8  text-center">
        <h1 className="text-3xl font-semibold  text-gray-900 py-5">Login</h1>

        {/* Google Login Form */}
        <div>
          <Button variant="custom_Google" size="custom_Google">
            <FcGoogle className="size-6 " />{" "}
            <span className="font-medium">Login with Google</span>
          </Button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-xs tracking-wide text-gray-400">
            or sign up through email
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        {/* Email Login Form */}
        <div className="space-y-4">
          <Input type="email" placeholder="Email ID" className="h-11" />
          <Input type="password" placeholder="Password" className="h-11" />
        </div>

        {/* Submit Button */}
        <div>
          <Button variant="login" size="login"  className="py-5">
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
