"use client";

import { FileAnalysis } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge, VerdictBadge } from "@/components/ui/badge";
import { FileCode, Hash, HardDrive, Cpu, ShieldCheck, CheckCircle2 } from "lucide-react";

interface FilePreviewProps {
  analysis: FileAnalysis;
}

export function FilePreview({ analysis }: FilePreviewProps) {
  return (
    <Card className="p-6 bg-slate-950/80 border-cyan-500/30 space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-mono">{analysis.filename}</h3>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>{formatBytes(analysis.filesize)}</span>
              <span>•</span>
              <span className="uppercase font-semibold text-cyan-400">.{analysis.extension || 'RAW'}</span>
            </span>
          </div>
        </div>

        <VerdictBadge status={analysis.status} />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-cyan-400" /> Claimed MIME Type
          </span>
          <p className="text-slate-200 font-semibold truncate">{analysis.mimeType}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" /> Header Magic Format
          </span>
          <p className="text-slate-200 font-semibold truncate">{analysis.detectedFormat}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 col-span-1 md:col-span-2">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Hash className="w-3 h-3 text-cyan-400" /> SHA-256 Checksum
          </span>
          <p className="text-cyan-300 font-mono text-[11px] break-all select-all">{analysis.sha256}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 col-span-1 md:col-span-2">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> First 8 Header Magic Bytes
          </span>
          <p className="text-emerald-400 font-mono text-xs font-bold tracking-widest">{analysis.magicBytesHex}</p>
        </div>
      </div>
    </Card>
  );
}
