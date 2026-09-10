import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  color?: 'cyan' | 'rose' | 'amber' | 'emerald';
}

export function Progress({ value, color = 'cyan', className, ...props }: ProgressProps) {
  const colorStyles = {
    cyan: "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(0,242,254,0.5)]",
    rose: "bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
    amber: "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
  };

  return (
    <div
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/50", className)}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-out rounded-full", colorStyles[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
