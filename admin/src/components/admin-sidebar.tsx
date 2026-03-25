// admin/src/components/admin-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/specimens", label: "Specimens", icon: "🔬" },
] as const;

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-admin-bg-secondary border-r border-admin-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-admin-border">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍄</span>
          <div>
            <div className="font-bold text-sm">Flash Fungi</div>
            <div className="text-xs text-admin-accent">Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-admin-accent/10 text-admin-accent border border-admin-accent/20"
                  : "text-admin-text-secondary hover:text-admin-text hover:bg-admin-bg-hover"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Sign out */}
      <div className="p-4 border-t border-admin-border">
        <div className="text-xs text-admin-text-muted truncate mb-2">
          {userEmail}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-admin-text-muted hover:text-admin-danger transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
