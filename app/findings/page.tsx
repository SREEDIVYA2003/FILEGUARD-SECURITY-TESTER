"use client";

import { useEffect, useState } from "react";
import { Finding } from "@/types";
import { getStoredFindings, updateFindingStatus } from "@/lib/storage";
import { FindingCard } from "@/components/findings/finding-card";
import { FindingFilter } from "@/components/findings/finding-filter";
import { FindingDialog } from "@/components/findings/finding-dialog";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    setFindings(getStoredFindings());
  }, []);

  const handleStatusChange = (id: string, status: Finding['status']) => {
    const updated = updateFindingStatus(id, status);
    setFindings(updated);
  };

  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== "ALL" && f.severity !== severityFilter) return false;
    if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = f.testName.toLowerCase().includes(q);
      const matchFile = f.filename.toLowerCase().includes(q);
      const matchCwe = f.cwe.toLowerCase().includes(q);
      if (!matchName && !matchFile && !matchCwe) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" /> Master Security Findings Database
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Centralized inventory of all vulnerability findings detected across file scans.
        </p>
      </div>

      {/* Filter Toolbar */}
      <FindingFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center border border-slate-800 rounded-xl bg-slate-950/40 space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Findings Match Your Filters</h4>
            <p className="text-xs text-slate-500">Try clearing or broadening your search parameters.</p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onSelect={setSelectedFinding}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Finding Detail Dialog */}
      <FindingDialog
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}
