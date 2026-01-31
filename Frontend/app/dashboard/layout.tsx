import { getMe } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //   let me;
  //   try {
  //     me = await getMe();
  //   } catch  {
  //     redirect("/login");
  //   }

  return (
    <div className=" flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
