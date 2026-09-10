"use client";

import { Search, Filter } from "lucide-react";

interface FindingFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  severityFilter: string;
  onSeverityChange: (s: string) => void;
  statusFilter: string;
  onStatusChange: (st: string) => void;
}

export function FindingFilter({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
}: FindingFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by filename or CWE..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Select Filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Severity:</span>
        </div>
        <select
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none"
        >
          <option value="ALL">ALL SEVERITIES</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none"
        >
          <option value="ALL">ALL STATUSES</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_REVIEW">IN REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>
    </div>
  );
}
