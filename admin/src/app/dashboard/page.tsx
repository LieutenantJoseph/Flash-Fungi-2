// admin/src/app/dashboard/page.tsx
// Content dashboard showing what needs review and completion status.

import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createAdminClient();

  // Fetch all counts in parallel
  const [
    { count: totalSpecimens },
    { count: approvedSpecimens },
    { count: pendingSpecimens },
    { count: rejectedSpecimens },
    { count: publishedGuides },
    { count: draftGuides },
    { count: totalModules },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("specimens").select("*", { count: "exact", head: true }),
    supabase.from("specimens").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("specimens").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("specimens").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("field_guides").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("field_guides").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("training_modules").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
  ]);

  // Fetch recent pending specimens
  const { data: recentPending } = await supabase
    .from("specimens")
    .select("id, species_name, common_name, family, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  // Approved specimens without a published field guide
  const { data: approvedList } = await supabase
    .from("specimens")
    .select("species_name")
    .eq("status", "approved");

  const { data: publishedGuidesList } = await supabase
    .from("field_guides")
    .select("species_name")
    .eq("status", "published");

  const publishedSpeciesSet = new Set((publishedGuidesList ?? []).map(g => g.species_name));
  const missingGuides = (approvedList ?? [])
    .filter(s => !publishedSpeciesSet.has(s.species_name))
    .map(s => s.species_name);
  const uniqueMissingGuides = [...new Set(missingGuides)];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-admin-text-secondary text-sm mt-1">
          Content overview and action items
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Specimens" value={totalSpecimens ?? 0} icon="🔬" />
        <StatCard label="Approved" value={approvedSpecimens ?? 0} icon="✅" color="text-green-400" />
        <StatCard label="Pending Review" value={pendingSpecimens ?? 0} icon="⏳" color="text-yellow-400" href="/specimens?status=pending" />
        <StatCard label="Rejected" value={rejectedSpecimens ?? 0} icon="❌" color="text-red-400" />
        <StatCard label="Published Guides" value={publishedGuides ?? 0} icon="📖" color="text-blue-400" />
        <StatCard label="Draft Guides" value={draftGuides ?? 0} icon="📝" color="text-orange-400" />
        <StatCard label="Training Modules" value={totalModules ?? 0} icon="🎓" />
        <StatCard label="Users" value={totalUsers ?? 0} icon="👥" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Review Queue */}
        <div className="p-5 rounded-xl bg-admin-bg-card border border-admin-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span>⏳</span> Pending Review
            </h2>
            {(pendingSpecimens ?? 0) > 0 && (
              <Link
                href="/specimens?status=pending"
                className="text-sm text-admin-accent hover:underline"
              >
                View all →
              </Link>
            )}
          </div>

          {(recentPending ?? []).length === 0 ? (
            <p className="text-admin-text-muted text-sm">No specimens pending review.</p>
          ) : (
            <div className="space-y-3">
              {(recentPending ?? []).map((specimen) => (
                <Link
                  key={specimen.id}
                  href={`/specimens?status=pending`}
                  className="block p-3 rounded-lg bg-admin-bg-secondary hover:bg-admin-bg-hover border border-admin-border/50 transition-colors"
                >
                  <div className="font-medium text-sm italic">{specimen.species_name}</div>
                  <div className="text-xs text-admin-text-muted flex items-center gap-2 mt-1">
                    <span>{specimen.family}</span>
                    <span>·</span>
                    <span>{new Date(specimen.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Missing Field Guides */}
        <div className="p-5 rounded-xl bg-admin-bg-card border border-admin-border">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <span>📝</span> Missing Field Guides
          </h2>

          {uniqueMissingGuides.length === 0 ? (
            <p className="text-admin-text-muted text-sm">All approved species have published field guides.</p>
          ) : (
            <>
              <p className="text-sm text-admin-text-secondary mb-3">
                {uniqueMissingGuides.length} approved species without a published field guide:
              </p>
              <div className="space-y-2">
                {uniqueMissingGuides.slice(0, 8).map((name) => (
                  <div
                    key={name}
                    className="p-2 rounded bg-admin-bg-secondary text-sm italic text-admin-text-secondary"
                  >
                    {name}
                  </div>
                ))}
                {uniqueMissingGuides.length > 8 && (
                  <p className="text-xs text-admin-text-muted">
                    +{uniqueMissingGuides.length - 8} more
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  color?: string;
  href?: string;
}) {
  const content = (
    <div className={`p-4 rounded-xl bg-admin-bg-card border border-admin-border ${href ? "hover:border-admin-accent/50 transition-colors" : ""}`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color || "text-admin-text"}`}>{value}</div>
      <div className="text-xs text-admin-text-muted mt-1">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
