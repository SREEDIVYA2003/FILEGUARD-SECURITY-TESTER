"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileAnalysis, Finding, MetricSummary } from "@/types";
import { getStoredScans, getStoredFindings, calculateSummaryMetrics, deleteScan } from "@/lib/storage";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SeverityChart } from "@/components/dashboard/severity-chart";
import { ScanTrendsChart } from "@/components/dashboard/scan-trends-chart";
import { RecentScans } from "@/components/dashboard/recent-scans";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  UploadCloud
} from "lucide-react";

export default function DashboardPage() {
  const [scans, setScans] = useState<FileAnalysis[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [metrics, setMetrics] = useState<MetricSummary>({
    totalScans: 0,
    filesAnalyzed: 0,
    vulnerabilitiesFound: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    lowFindings: 0,
    cleanFiles: 0,
  });

  useEffect(() => {
    const loadedScans = getStoredScans();
    const loadedFindings = getStoredFindings();
    setScans(loadedScans);
    setFindings(loadedFindings);
    setMetrics(calculateSummaryMetrics(loadedScans, loadedFindings));
  }, []);

  const handleDeleteScan = (id: string) => {
    const updated = deleteScan(id);
    const updatedFindings = getStoredFindings();
    setScans(updated);
    setFindings(updatedFindings);
    setMetrics(calculateSummaryMetrics(updated, updatedFindings));
  };

  return (
    <div className="theme-dashboard min-h-screen -m-6 p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900/90 to-rose-950/30 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,254,0.1)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <Zap className="w-3.5 h-3.5" /> Authorized Testing Console
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
              <span>File-Upload Security Dashboard</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Safe, non-destructive static file security inspector. Analyzes file signatures, dangerous extension evasions, double extensions, SVG scripts, and traversal risks without execution.
            </p>
          </div>

          <Link href="/analyzer" className="shrink-0">
            <Button variant="cyber" size="lg" className="shadow-[0_0_25px_rgba(0,242,254,0.4)]">
              <UploadCloud className="w-5 h-5 mr-2" />
              <span>Launch File Analyzer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Scans"
          value={metrics.totalScans}
          subtitle="Audit logs retained"
          icon={FileCheck}
          trend="+14% this week"
          variant="cyan"
        />
        <MetricCard
          title="Files Analyzed"
          value={metrics.filesAnalyzed}
          subtitle={`${metrics.cleanFiles} Clean Files`}
          icon={ShieldCheck}
          variant="emerald"
        />
        <MetricCard
          title="Vulnerabilities Found"
          value={metrics.vulnerabilitiesFound}
          subtitle="Active findings logged"
          icon={AlertTriangle}
          variant="amber"
        />
        <MetricCard
          title="Critical Findings"
          value={metrics.criticalFindings}
          subtitle="High risk execution flaws"
          icon={ShieldAlert}
          variant="rose"
        />
      </div>

      {/* Secondary Severity Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center justify-between">
          <span className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Critical Risk
          </span>
          <span className="text-2xl font-extrabold text-rose-400">{metrics.criticalFindings}</span>
        </div>
        <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)] flex items-center justify-between">
          <span className="text-xs text-orange-300 font-semibold">High Risk</span>
          <span className="text-2xl font-extrabold text-orange-400">{metrics.highFindings}</span>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-between">
          <span className="text-xs text-amber-300 font-semibold">Medium Risk</span>
          <span className="text-2xl font-extrabold text-amber-400">{metrics.mediumFindings}</span>
        </div>
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-between">
          <span className="text-xs text-blue-300 font-semibold">Low Risk</span>
          <span className="text-2xl font-extrabold text-blue-400">{metrics.lowFindings}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScanTrendsChart />
        </div>
        <div>
          <SeverityChart summary={metrics} />
        </div>
      </div>

      {/* Recent Scans Table */}
      <Card className="p-6 border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <RecentScans scans={scans} onDeleteScan={handleDeleteScan} />
      </Card>
    </div>
  );

}
