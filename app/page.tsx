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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/20 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <Zap className="w-3.5 h-3.5" /> Authorized Testing Console
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              File-Upload Security Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Safe, non-destructive static file security inspector. Analyzes file signatures, dangerous extension evasions, double extensions, SVG scripts, and traversal risks without execution.
            </p>
          </div>

          <Link href="/analyzer" className="shrink-0">
            <Button variant="cyber" size="lg">
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
        <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">Critical Risk</span>
          <span className="text-xl font-bold text-rose-400">{metrics.criticalFindings}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-orange-500/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">High Risk</span>
          <span className="text-xl font-bold text-orange-400">{metrics.highFindings}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">Medium Risk</span>
          <span className="text-xl font-bold text-amber-400">{metrics.mediumFindings}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">Low Risk</span>
          <span className="text-xl font-bold text-blue-400">{metrics.lowFindings}</span>
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
      <Card className="p-6">
        <RecentScans scans={scans} onDeleteScan={handleDeleteScan} />
      </Card>
    </div>
  );
}
