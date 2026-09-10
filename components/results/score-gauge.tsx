"use client";

import { FileSecurityVerdict } from "@/types";
import { VerdictBadge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  status: FileSecurityVerdict;
}

export function ScoreGauge({ score, status }: ScoreGaugeProps) {
  const getGaugeColor = (s: number) => {
    if (s >= 80) return "text-emerald-400 stroke-emerald-500";
    if (s >= 50) return "text-amber-400 stroke-amber-500";
    return "text-rose-400 stroke-rose-500";
  };

  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-slate-800 rounded-xl bg-slate-950/80 text-center space-y-4">
      {/* SVG Radial Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-slate-800 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            className={`fill-none transition-all duration-1000 ${getGaugeColor(score)}`}
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{score}</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Score</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          {status === 'CLEAN' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
          {status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {status === 'CRITICAL' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
          <VerdictBadge status={status} />
        </div>
        <p className="text-xs text-slate-400 font-mono">
          {score >= 80 ? "File passed critical checks safely." : score >= 50 ? "Warnings detected. Review remediation." : "High vulnerability risk. Reject file."}
        </p>
      </div>
    </div>
  );
}
