// admin/src/components/specimen-table.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Specimen {
  id: string;
  species_name: string;
  genus: string;
  family: string;
  common_name: string | null;
  inaturalist_id: string;
  location: string | null;
  dna_sequenced: boolean;
  status: string;
  quality_score: number | null;
  admin_notes: string | null;
  created_at: string;
}

interface SpecimenTableProps {
  specimens: Specimen[];
  families: string[];
  currentStatus: string;
  currentFamily: string;
  currentSearch: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  approved: "bg-green-400/10 text-green-400 border-green-400/20",
  rejected: "bg-red-400/10 text-red-400 border-red-400/20",
  archived: "bg-gray-400/10 text-gray-400 border-gray-400/20",
};

export function SpecimenTable({
  specimens,
  families,
  currentStatus,
  currentFamily,
  currentSearch,
  currentPage,
  totalPages,
  totalCount,
}: SpecimenTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // Reset to page 1 on filter change
    startTransition(() => {
      router.push(`/specimens?${params.toString()}`);
    });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/specimens?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", searchInput);
  };

  const handleAction = async (specimenId: string, action: string) => {
    setActionLoading(specimenId);
    try {
      const res = await fetch("/api/specimens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specimenId, action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert("Failed to update specimen");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Status filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="px-3 py-2 rounded-lg bg-admin-bg-secondary border border-admin-border text-sm text-admin-text focus:border-admin-accent outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Family filter */}
        <select
          value={currentFamily}
          onChange={(e) => updateFilter("family", e.target.value)}
          className="px-3 py-2 rounded-lg bg-admin-bg-secondary border border-admin-border text-sm text-admin-text focus:border-admin-accent outline-none"
        >
          <option value="all">All Families</option>
          {families.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search species..."
            className="px-3 py-2 rounded-lg bg-admin-bg-secondary border border-admin-border text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent outline-none w-48"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-admin-accent text-white text-sm hover:bg-admin-accent-hover transition-colors"
          >
            Search
          </button>
        </form>

        {/* Loading indicator */}
        {isPending && (
          <div className="flex items-center text-sm text-admin-text-muted">
            Loading...
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-bg-secondary border-b border-admin-border">
              <th className="text-left px-4 py-3 font-medium text-admin-text-secondary">Species</th>
              <th className="text-left px-4 py-3 font-medium text-admin-text-secondary">Family</th>
              <th className="text-left px-4 py-3 font-medium text-admin-text-secondary">Status</th>
              <th className="text-left px-4 py-3 font-medium text-admin-text-secondary">DNA</th>
              <th className="text-left px-4 py-3 font-medium text-admin-text-secondary">Quality</th>
              <th className="text-left px-4 py-3 font-medium text-admin-text-secondary">Date</th>
              <th className="text-right px-4 py-3 font-medium text-admin-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {specimens.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-admin-text-muted">
                  No specimens found matching your filters.
                </td>
              </tr>
            ) : (
              specimens.map((specimen) => (
                <tr
                  key={specimen.id}
                  className="border-b border-admin-border/50 hover:bg-admin-bg-hover/50 transition-colors"
                >
                  {/* Species */}
                  <td className="px-4 py-3">
                    <div className="font-medium italic">{specimen.species_name}</div>
                    {specimen.common_name && (
                      <div className="text-xs text-admin-text-muted">{specimen.common_name}</div>
                    )}
                  </td>

                  {/* Family */}
                  <td className="px-4 py-3 text-admin-text-secondary">
                    {specimen.family}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[specimen.status] || ""}`}>
                      {specimen.status}
                    </span>
                  </td>

                  {/* DNA */}
                  <td className="px-4 py-3">
                    {specimen.dna_sequenced ? (
                      <span className="text-green-400" title="DNA verified">🧬</span>
                    ) : (
                      <span className="text-admin-text-muted">—</span>
                    )}
                  </td>

                  {/* Quality */}
                  <td className="px-4 py-3 text-admin-text-secondary">
                    {specimen.quality_score ?? "—"}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-admin-text-muted text-xs">
                    {new Date(specimen.created_at).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {specimen.status !== "approved" && (
                        <button
                          onClick={() => handleAction(specimen.id, "approve")}
                          disabled={actionLoading === specimen.id}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                          title="Approve"
                        >
                          ✓
                        </button>
                      )}
                      {specimen.status !== "rejected" && (
                        <button
                          onClick={() => handleAction(specimen.id, "reject")}
                          disabled={actionLoading === specimen.id}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                          title="Reject"
                        >
                          ✗
                        </button>
                      )}
                      {specimen.status !== "pending" && specimen.status !== "archived" && (
                        <button
                          onClick={() => handleAction(specimen.id, "pending")}
                          disabled={actionLoading === specimen.id}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 disabled:opacity-50 transition-colors"
                          title="Return to pending"
                        >
                          ↩
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-admin-text-muted">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg text-sm bg-admin-bg-secondary border border-admin-border text-admin-text-secondary hover:bg-admin-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm bg-admin-bg-secondary border border-admin-border text-admin-text-secondary hover:bg-admin-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
