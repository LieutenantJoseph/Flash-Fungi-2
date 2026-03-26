// src/app/(app)/study/quick/page.tsx
// Quick Study — 10 random specimens, timed feel.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loadStudyData } from "@/lib/api/study-loader";
import { StudyEngine } from "@/components/study/study-engine";

export const metadata = { title: "Quick Study" };

export default async function QuickStudyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { specimens, photos, guides } = await loadStudyData(supabase);

  return (
    <div className="animate-fade-in py-4">
      <StudyEngine
        userId={user.id}
        mode="quick"
        specimens={specimens}
        photos={photos}
        guides={guides}
        maxQuestions={10}
      />
    </div>
  );
}
