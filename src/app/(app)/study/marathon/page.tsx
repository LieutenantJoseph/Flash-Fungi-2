// src/app/(app)/study/marathon/page.tsx
// Marathon Mode — unlimited study, loops through all specimens.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loadStudyData } from "@/lib/api/study-loader";
import { StudyEngine } from "@/components/study/study-engine";

export const metadata = { title: "Marathon Mode" };

export default async function MarathonPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { specimens, photos, guides } = await loadStudyData(supabase);

  return (
    <div className="animate-fade-in py-4">
      <StudyEngine
        userId={user.id}
        mode="marathon"
        specimens={specimens}
        photos={photos}
        guides={guides}
        // No maxQuestions — marathon is unlimited
      />
    </div>
  );
}
