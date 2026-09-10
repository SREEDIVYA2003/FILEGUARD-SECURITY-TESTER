"use client";

import Link from "next/link";
import { FileAnalysis } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { VerdictBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileText, ArrowRight, ShieldCheck, Trash2, Download } from "lucide-react";
import { enrichScanWithReports } from "@/lib/enrich-scan";
import { generateHtmlReport } from "@/lib/html-report-generator";

interface RecentScansProps {
  scans: FileAnalysis[];
  onDeleteScan?: (id: string) => void;
}

export function RecentScans({ scans, onDeleteScan }: RecentScansProps) {
  const handleDownloadHtmlReport = (scan: FileAnalysis) => {
    const enriched = enrichScanWithReports(scan);
    const htmlContent = generateHtmlReport(enriched);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `VirusTotal-Report-${scan.filename}.html`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };
  if (!scans || scans.length === 0) {
    return (
      <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/40 space-y-3">
        <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-300">No Recent Scans Found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Upload files in the File Analyzer to initiate automated non-destructive security checks.
        </p>
        <Link href="/analyzer" className="inline-block mt-2">
          <Button variant="cyber" size="sm">Go to File Analyzer</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Recent File Scans</span>
        </h3>
        <Link href="/results" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
          <span>View All Results</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Format & Size</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Verdict</TableHead>
            <TableHead>Scanned At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.slice(0, 5).map((scan) => (
            <TableRow key={scan.id}>
              <TableCell className="font-mono text-xs font-semibold text-cyan-300">
                <Link href={`/results/${scan.id}`} className="hover:underline flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{scan.filename}</span>
                </Link>
              </TableCell>

              <TableCell className="text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-300">{scan.detectedFormat}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{formatBytes(scan.filesize)}</span>
                </div>
              </TableCell>

              <TableCell className="font-mono text-xs font-bold">
                <span className={scan.score >= 80 ? "text-emerald-400" : scan.score >= 50 ? "text-amber-400" : "text-rose-400"}>
                  {scan.score}/100
                </span>
              </TableCell>

              <TableCell>
                <VerdictBadge status={scan.status} />
              </TableCell>

              <TableCell className="text-xs text-slate-400 font-mono">
                {formatDate(scan.uploadedAt)}
              </TableCell>

              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadHtmlReport(scan)}
                  title="Download Complete HTML Security Report"
                  className="px-2.5 font-mono text-xs text-cyan-400 border-cyan-500/30 gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> HTML Report
                </Button>
                <Link href={`/results/${scan.id}`}>
                  <Button variant="outline" size="sm">Report</Button>
                </Link>
                {onDeleteScan && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteScan(scan.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
