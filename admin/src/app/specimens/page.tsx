// admin/src/app/specimens/page.tsx
// Specimen management — browse, filter, approve, reject specimens.

import { createAdminClient } from "@/lib/supabase/server";
import { SpecimenTable } from "@/components/specimen-table";

export const metadata = { title: "Specimens" };

interface PageProps {
  searchParams: Promise<{
    status?: string;
    family?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function SpecimensPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createAdminClient();

  const statusFilter = params.status || "all";
  const familyFilter = params.family || "all";
  const searchFilter = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query — admin client bypasses RLS, sees ALL specimens
  let query = supabase
    .from("specimens")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (familyFilter !== "all") {
    query = query.eq("family", familyFilter);
  }
  if (searchFilter) {
    query = query.ilike("species_name", `%${searchFilter}%`);
  }

  const { data: specimens, count } = await query;

  // Get unique families for filter dropdown
  const { data: familyData } = await supabase
    .from("specimens")
    .select("family")
    .order("family", { ascending: true });

  const families = [...new Set((familyData ?? []).map((d: { family: string }) => d.family))].filter(Boolean);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Specimens</h1>
        <p className="text-admin-text-secondary text-sm mt-1">
          {count ?? 0} total specimens
        </p>
      </div>

      <SpecimenTable
        specimens={specimens ?? []}
        families={families}
        currentStatus={statusFilter}
        currentFamily={familyFilter}
        currentSearch={searchFilter}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count ?? 0}
      />
    </div>
  );
}
