import { apiFetch } from "./api/api.server";
import type { MeResponse } from "./types/auth";

export async function getMe() {
  return apiFetch<MeResponse>("/api/v1/auth/me");
}

export async function Logout() {
  return apiFetch<{ message: string }>("/api/v1/auth/logout", {
    method: "POST",
  });
}
