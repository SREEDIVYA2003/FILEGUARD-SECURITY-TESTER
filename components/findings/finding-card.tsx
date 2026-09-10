"use client";

import { Finding } from "@/types";
import { SeverityBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, FileText, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface FindingCardProps {
  finding: Finding;
  onSelect: (finding: Finding) => void;
  onStatusChange?: (id: string, status: Finding['status']) => void;
}

export function FindingCard({ finding, onSelect, onStatusChange }: FindingCardProps) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 mt-0.5 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-sm text-slate-100">{finding.testName}</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{finding.cwe}</span>
            <SeverityBadge severity={finding.severity} />
          </div>

          <p className="text-xs text-slate-300 line-clamp-1">{finding.description}</p>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> {finding.filename}
            </span>
            <span>•</span>
            <span>{formatDate(finding.timestamp)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        {onStatusChange && (
          <select
            value={finding.status}
            onChange={(e) => onStatusChange(finding.id, e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="MUTED">MUTED</option>
          </select>
        )}

        <Button variant="outline" size="sm" onClick={() => onSelect(finding)}>
          <span>Details & Fix</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
