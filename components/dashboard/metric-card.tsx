import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple';
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'cyan' }: MetricCardProps) {
  const styles = {
    cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    rose: "border-rose-500/30 text-rose-400 bg-rose-500/10",
    amber: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    purple: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  };

  return (
    <Card className="p-5 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">{title}</span>
          <div className="text-2xl font-extrabold tracking-tight text-white font-mono flex items-baseline gap-2">
            <span>{value}</span>
            {trend && (
              <span className="text-xs font-normal text-emerald-400 font-sans">
                {trend}
              </span>
            )}
          </div>
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>

        <div className={cn("p-3 rounded-xl border transition-all duration-300 group-hover:scale-110", styles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Decorative Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
