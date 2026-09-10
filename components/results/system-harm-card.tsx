"use client";

import { SystemHarmAssessment } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, HardDrive, Key, Globe, Cpu, ShieldCheck, ShieldAlert, Zap } from "lucide-react";

interface SystemHarmCardProps {
  assessment: SystemHarmAssessment;
}

export function SystemHarmCard({ assessment }: SystemHarmCardProps) {
  const harmStyles = {
    CRITICAL_SYSTEM_DAMAGE: {
      bg: "bg-rose-950/40 border-rose-500/60 text-rose-300",
      badgeVariant: "critical" as const,
      label: "CRITICAL DEVICE HARM RISK",
      icon: ShieldAlert
    },
    HIGH_SYSTEM_RISK: {
      bg: "bg-orange-950/40 border-orange-500/60 text-orange-300",
      badgeVariant: "high" as const,
      label: "HIGH SYSTEM RISK",
      icon: AlertTriangle
    },
    MODERATE_RISK: {
      bg: "bg-amber-950/40 border-amber-500/60 text-amber-300",
      badgeVariant: "medium" as const,
      label: "MODERATE APPLICATION RISK",
      icon: Zap
    },
    LOW_RISK: {
      bg: "bg-blue-950/40 border-blue-500/60 text-blue-300",
      badgeVariant: "low" as const,
      label: "LOW POTENTIAL RISK",
      icon: Zap
    },
    SAFE_NO_HARM: {
      bg: "bg-emerald-950/30 border-emerald-500/40 text-emerald-300",
      badgeVariant: "pass" as const,
      label: "SAFE / NO DEVICE HARM",
      icon: ShieldCheck
    }
  };

  const style = harmStyles[assessment.harmLevel] || harmStyles.SAFE_NO_HARM;
  const Icon = style.icon;

  return (
    <Card className={`p-6 border rounded-2xl ${style.bg} space-y-5 shadow-2xl font-mono`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              System & Device Harm Risk Assessment
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates operating system, file system, network, and memory injection impact.
            </p>
          </div>
        </div>

        <Badge variant={style.badgeVariant} className="text-xs px-3 py-1 font-extrabold tracking-wider shrink-0">
          {style.label}
        </Badge>
      </div>

      {/* Summary Banner */}
      <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
        {assessment.overallHarmSummary}
      </p>

      {/* 4 Vector Damage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Vector 1: File System */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${assessment.fileSystemDamage.risk ? "bg-rose-950/20 border-rose-500/30 text-rose-200" : "bg-slate-900/60 border-slate-800 text-slate-300"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" /> OS & File System Damage
            </span>
            <Badge variant={assessment.fileSystemDamage.risk ? "critical" : "pass"}>
              {assessment.fileSystemDamage.risk ? "RISK" : "SAFE"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">{assessment.fileSystemDamage.description}</p>
        </div>

        {/* Vector 2: Registry & Startup */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${assessment.registryPersistence.risk ? "bg-rose-950/20 border-rose-500/30 text-rose-200" : "bg-slate-900/60 border-slate-800 text-slate-300"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Registry & Startup Persistence
            </span>
            <Badge variant={assessment.registryPersistence.risk ? "warning" : "pass"}>
              {assessment.registryPersistence.risk ? "RISK" : "SAFE"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">{assessment.registryPersistence.description}</p>
        </div>

        {/* Vector 3: Network Exfiltration */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${assessment.networkExfiltration.risk ? "bg-rose-950/20 border-rose-500/30 text-rose-200" : "bg-slate-900/60 border-slate-800 text-slate-300"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Network Data Exfiltration
            </span>
            <Badge variant={assessment.networkExfiltration.risk ? "critical" : "pass"}>
              {assessment.networkExfiltration.risk ? "RISK" : "SAFE"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">{assessment.networkExfiltration.description}</p>
        </div>

        {/* Vector 4: Process Injection */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${assessment.processInjection.risk ? "bg-rose-950/20 border-rose-500/30 text-rose-200" : "bg-slate-900/60 border-slate-800 text-slate-300"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Process & Memory Injection
            </span>
            <Badge variant={assessment.processInjection.risk ? "critical" : "pass"}>
              {assessment.processInjection.risk ? "RISK" : "SAFE"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">{assessment.processInjection.description}</p>
        </div>
      </div>

      {/* Impact Tags */}
      {assessment.deviceImpactTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase">Impact Vector Tags:</span>
          {assessment.deviceImpactTags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-cyan-300">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
