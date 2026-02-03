const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie:
        "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWwyanl2aWswMDAwNmFwaW15ZHZqZXNzIiwiaWF0IjoxNzcwMDI2MTU0LCJleHAiOjE3NzA2MzA5NTR9.rAJsQ76YVOidtF4uP_xPVTJpybjkZvJC1ST_0UrVuO4",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed :${res.status}`);
  }

  return res.json() as Promise<T>;
}
