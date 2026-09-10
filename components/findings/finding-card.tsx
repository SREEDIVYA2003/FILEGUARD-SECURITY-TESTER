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
  const isCritical = finding.severity === 'CRITICAL';
  const isHigh = finding.severity === 'HIGH';
  const isMedium = finding.severity === 'MEDIUM';

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md ${
      isCritical
        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        : isHigh
        ? 'bg-orange-950/20 border-orange-500/40 hover:border-orange-500/70 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
        : isMedium
        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg border mt-0.5 shrink-0 ${
          isCritical
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
            : isHigh
            ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
            : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-sm text-slate-100">{finding.testName}</span>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">{finding.cwe}</span>
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
            className="bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/50"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="MUTED">MUTED</option>
          </select>
        )}

        <Button variant="outline" size="sm" onClick={() => onSelect(finding)} className="hover:border-amber-500/40 hover:text-amber-300">
          <span>Details & Fix</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

}
