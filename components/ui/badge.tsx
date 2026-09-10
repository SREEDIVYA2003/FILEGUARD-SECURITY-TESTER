import * as React from "react";
import { cn } from "@/lib/utils";
import { Severity, CheckStatus, FileSecurityVerdict } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'critical' | 'high' | 'medium' | 'low' | 'info' | 'pass' | 'warning' | 'fail' | 'cyan';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    outline: "bg-transparent text-slate-300 border-slate-700",
    cyan: "bg-cyan-400/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,242,254,0.2)]",
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    info: "bg-slate-500/20 text-slate-300 border-slate-600",
    pass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    fail: "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, BadgeProps['variant']> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
  };
  return <Badge variant={map[severity]}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: CheckStatus }) {
  const map: Record<CheckStatus, BadgeProps['variant']> = {
    PASS: 'pass',
    WARNING: 'warning',
    FAIL: 'fail',
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}

export function VerdictBadge({ status }: { status: FileSecurityVerdict }) {
  const map: Record<FileSecurityVerdict, { variant: BadgeProps['variant']; label: string }> = {
    CLEAN: { variant: 'pass', label: 'CLEAN' },
    WARNING: { variant: 'warning', label: 'WARNING' },
    SUSPICIOUS: { variant: 'high', label: 'SUSPICIOUS' },
    CRITICAL: { variant: 'critical', label: 'CRITICAL RISK' },
  };
  const config = map[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
