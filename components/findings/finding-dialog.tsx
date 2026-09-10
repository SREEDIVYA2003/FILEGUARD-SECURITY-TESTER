"use client";

import { Finding } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/ui/badge";
import { RemediationTab } from "@/components/results/remediation-tab";
import { ShieldAlert, FileText, Calendar, Terminal } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FindingDialogProps {
  finding: Finding | null;
  onClose: () => void;
}

export function FindingDialog({ finding, onClose }: FindingDialogProps) {
  if (!finding) return null;

  return (
    <Dialog
      isOpen={!!finding}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>{finding.testName}</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Overview Header Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{finding.cwe}</span>
            <SeverityBadge severity={finding.severity} />
          </div>

          <p className="text-sm font-semibold text-slate-200">{finding.description}</p>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" /> File: {finding.filename}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" /> Scanned: {formatDate(finding.timestamp)}
            </span>
          </div>
        </div>

        {/* Technical Evidence */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-400" /> Technical Evidence Log
          </h4>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 leading-relaxed break-all select-all">
            {finding.evidence}
          </div>
        </div>

        {/* Developer Remediation Guide */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
            Remediation & Fix Implementation Guide
          </h4>
          <RemediationTab cweId={finding.cwe} />
        </div>
      </div>
    </Dialog>
  );
}
