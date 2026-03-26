// src/app/(app)/study/focused/page.tsx
// Focused Study — filter by family, then study those species.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loadStudyData } from "@/lib/api/study-loader";
import { getUniqueFamilies } from "@/lib/api/specimens";
import { FocusedStudyClient } from "@/components/study/focused-study-client";

export const metadata = { title: "Focused Study" };

interface PageProps {
  searchParams: Promise<{ family?: string }>;
}

export default async function FocusedStudyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const families = await getUniqueFamilies(supabase);
  const selectedFamily = params.family || null;

  let studyData = null;
  if (selectedFamily) {
    studyData = await loadStudyData(supabase, { family: selectedFamily });
  }

  return (
    <div className="animate-fade-in py-4">
      <FocusedStudyClient
        userId={user.id}
        families={families}
        selectedFamily={selectedFamily}
        studyData={studyData}
      />
    </div>
  );
}
