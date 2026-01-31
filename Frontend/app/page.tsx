import { getMe } from "@/lib/auth";

export default async function Home() {
  let me;
  try {
    me = await getMe();
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
        <p>Error loading user data.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <pre>{JSON.stringify(me, null, 2)} </pre>
    </div>
  );
}
