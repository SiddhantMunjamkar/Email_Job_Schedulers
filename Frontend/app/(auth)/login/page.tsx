"use client";

import { GoogleLogin } from "./google_login";
import {  EmailLoginForm } from "./email_login_form";

export default function Login() {
  return (
    <div className=" min-h-screen flex items-center justify-center bg-white ">
      <div className="w-[420px] rounded-xl border border-gray-200 bg-white  p-8  text-center mt-8 mb-8">
        <h1 className="text-3xl font-semibold  text-gray-900 py-5">Login</h1>

        {/* Google Login Form */}
        <GoogleLogin />

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-xs tracking-wide text-gray-400">
            or sign up through email
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email Login Form */}
        <EmailLoginForm />


      </div>
    </div>
  );
}
