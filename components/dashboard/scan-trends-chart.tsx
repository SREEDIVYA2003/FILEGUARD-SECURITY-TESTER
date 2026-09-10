"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function ScanTrendsChart() {
  const days = [
    { day: "Mon", scans: 14, issues: 3 },
    { day: "Tue", scans: 22, issues: 5 },
    { day: "Wed", scans: 18, issues: 2 },
    { day: "Thu", scans: 31, issues: 8 },
    { day: "Fri", scans: 25, issues: 4 },
    { day: "Sat", scans: 10, issues: 1 },
    { day: "Sun", scans: 16, issues: 3 },
  ];

  const maxScans = 35;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>7-Day Scan Activity</span>
        </CardTitle>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          +24.5% vs last week
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
          {days.map((d) => {
            const scanHeightPct = Math.round((d.scans / maxScans) * 100);
            const issueHeightPct = Math.round((d.issues / maxScans) * 100);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-950/60 rounded-t-lg h-36 flex items-end justify-center gap-1 p-1 border-t border-slate-800 relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-cyan-500/40 text-[10px] font-mono px-2 py-1 rounded shadow-lg z-20 pointer-events-none whitespace-nowrap">
                    {d.scans} Scans ({d.issues} Flaws)
                  </div>

                  {/* Scans Bar */}
                  <div
                    style={{ height: `${scanHeightPct}%` }}
                    className="w-1/2 bg-cyan-500/80 group-hover:bg-cyan-400 rounded-t transition-all duration-300 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                  />
                  {/* Vulnerabilities Bar */}
                  <div
                    style={{ height: `${issueHeightPct}%` }}
                    className="w-1/2 bg-rose-500/80 group-hover:bg-rose-400 rounded-t transition-all duration-300"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
