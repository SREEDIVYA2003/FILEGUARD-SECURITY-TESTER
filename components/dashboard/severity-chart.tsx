"use client";

import { MetricSummary } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function SeverityChart({ summary }: { summary: MetricSummary }) {
  const total = (summary.criticalFindings + summary.highFindings + summary.mediumFindings + summary.lowFindings) || 1;

  const criticalPct = Math.round((summary.criticalFindings / total) * 100);
  const highPct = Math.round((summary.highFindings / total) * 100);
  const mediumPct = Math.round((summary.mediumFindings / total) * 100);
  const lowPct = Math.round((summary.lowFindings / total) * 100);

  const items = [
    { label: "Critical", count: summary.criticalFindings, pct: criticalPct, color: "bg-rose-500", textColor: "text-rose-400", border: "border-rose-500/30", icon: ShieldAlert },
    { label: "High", count: summary.highFindings, pct: highPct, color: "bg-orange-500", textColor: "text-orange-400", border: "border-orange-500/30", icon: AlertCircle },
    { label: "Medium", count: summary.mediumFindings, pct: mediumPct, color: "bg-amber-500", textColor: "text-amber-400", border: "border-amber-500/30", icon: AlertTriangle },
    { label: "Low", count: summary.lowFindings, pct: lowPct, color: "bg-blue-500", textColor: "text-blue-400", border: "border-blue-500/30", icon: Info },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stacked Distribution Bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-700/50">
          <div style={{ width: `${criticalPct}%` }} className="h-full bg-rose-500 rounded-s transition-all duration-500" title={`Critical: ${summary.criticalFindings}`} />
          <div style={{ width: `${highPct}%` }} className="h-full bg-orange-500 transition-all duration-500" title={`High: ${summary.highFindings}`} />
          <div style={{ width: `${mediumPct}%` }} className="h-full bg-amber-500 transition-all duration-500" title={`Medium: ${summary.mediumFindings}`} />
          <div style={{ width: `${lowPct}%` }} className="h-full bg-blue-500 rounded-e transition-all duration-500" title={`Low: ${summary.lowFindings}`} />
        </div>

        {/* Severity Items */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`p-3 rounded-lg bg-slate-950/60 border ${item.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.textColor}`} />
                  <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                </div>
                <span className={`font-mono font-extrabold text-sm ${item.textColor}`}>
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
