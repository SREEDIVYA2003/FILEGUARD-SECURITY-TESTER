"use client";

import { useState } from "react";
import { SecurityCheck } from "@/types";
import { StatusBadge, SeverityBadge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckCard({ check }: { check: SecurityCheck }) {
  const [expanded, setExpanded] = useState(check.status !== 'PASS');

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200 overflow-hidden bg-slate-950/70",
        check.status === 'FAIL' ? "border-rose-500/40 bg-rose-950/10" : check.status === 'WARNING' ? "border-amber-500/30 bg-amber-950/10" : "border-slate-800"
      )}
    >
      {/* Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          {check.status === 'PASS' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {check.status === 'WARNING' && <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />}
          {check.status === 'FAIL' && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">{check.name}</span>
              {check.cwe && <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{check.cwe}</span>}
            </div>
            <span className="text-xs text-slate-400 font-mono line-clamp-1">{check.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={check.status} />
          <SeverityBadge severity={check.severity} />
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Evidence & Inspection Output
            </span>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-slate-300 border border-slate-800 text-[11px] leading-relaxed break-all select-all">
              {check.evidence}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] font-mono">
              Recommended Remediation
            </span>
            <p className="text-slate-300 leading-relaxed bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
              {check.remediation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
