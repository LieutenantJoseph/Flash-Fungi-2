// admin/src/app/dashboard/layout.tsx
// Shared layout for all authenticated admin pages — sidebar + content area.

import { createAuthClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userEmail={user.email ?? "Admin"} />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  );
}
