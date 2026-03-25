// admin/src/app/api/specimens/route.ts
// Server-side API route for specimen status updates.
// Uses service role key — bypasses RLS.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return []; },
        setAll(_c: { name: string; value: string; options?: Record<string, unknown> }[]) {},
      },
    }
  );
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { specimenId, action, adminNotes } = body;

    if (!specimenId || !action) {
      return NextResponse.json(
        { error: "specimenId and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "archive", "pending"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use: approve, reject, archive, pending" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      archive: "archived",
      pending: "pending",
    };

    const updates: Record<string, unknown> = {
      status: statusMap[action],
      updated_at: new Date().toISOString(),
    };

    if (action === "approve") {
      updates.approved_at = new Date().toISOString();
    }

    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("specimens")
      .update(updates)
      .eq("id", specimenId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update specimen: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, specimen: data });
  } catch (error) {
    console.error("Specimen API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
