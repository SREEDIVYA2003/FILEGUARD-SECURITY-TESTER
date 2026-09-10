"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileAnalysis } from "@/types";
import { getStoredScans } from "@/lib/storage";
import { enrichScanWithReports } from "@/lib/enrich-scan";
import { generateHtmlReport } from "@/lib/html-report-generator";
import { ScoreGauge } from "@/components/results/score-gauge";
import { CheckCard } from "@/components/results/check-card";
import { RemediationTab } from "@/components/results/remediation-tab";
import { HexViewer } from "@/components/results/hex-viewer";
import { VendorGrid } from "@/components/results/vendor-grid";
import { FileOutputViewer } from "@/components/results/file-output-viewer";
import { SystemHarmCard } from "@/components/results/system-harm-card";
import { ThreatIntelTab } from "@/components/results/threat-intel-tab";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge, VerdictBadge } from "@/components/ui/badge";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Code2,
  Eye,
  Copy,
  Check,
  Flame,
  Globe,
  FileText
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function DetailedScanResultPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [scan, setScan] = useState<FileAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"vendors" | "intel" | "output" | "checks" | "remediation" | "hex">("vendors");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "FAIL" | "WARNING" | "PASS">("ALL");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const scans = getStoredScans();
    const found = scans.find(s => s.id === id);
    if (found) {
      setScan(enrichScanWithReports(found));
    }
  }, [params.id]);

  if (!scan) {
    return (
      <div className="p-12 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Scan Report Not Found</h3>
        <p className="text-xs text-slate-400">The requested report ID may have been deleted or reset.</p>
        <Link href="/results">
          <Button variant="cyber">Back to Results</Button>
        </Link>
      </div>
    );
  }

  const filteredChecks = scan.checks.filter(c => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  const handleCopyHash = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
    toast({
      type: 'info',
      title: 'Hash Copied',
      description: `Copied ${label} to clipboard`
    });
  };

  const handleExportHTML = () => {
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

    toast({
      type: 'success',
      title: 'HTML Report Downloaded',
      description: `Downloaded VirusTotal-Report-${scan.filename}.html`
    });
  };

  const handleExportJSON = () => {
    const enriched = enrichScanWithReports(scan);
    const blob = new Blob([JSON.stringify(enriched, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `VirusTotal-Report-${scan.filename}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    toast({
      type: 'success',
      title: 'JSON Report Downloaded',
      description: `Downloaded VirusTotal-Report-${scan.filename}.json`
    });
  };

  const handleDownloadFile = () => {
    if (!scan.fileDataUrl) {
      toast({
        type: 'warning',
        title: 'Download Unavailable',
        description: 'File data URL is only retained for local uploaded files under 5MB.'
      });
      return;
    }
    const a = document.createElement('a');
    a.href = scan.fileDataUrl;
    a.download = scan.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast({
      type: 'success',
      title: 'File Download Started',
      description: `Downloading ${scan.filename}`
    });
  };

  const detectionRatio = scan.detectionRatio || { malicious: 0, suspicious: 0, clean: 72, total: 72 };
  const virusPriority = scan.virusContentPriority || "P5-SAFE";
  const virusCategory = scan.virusCategory || "Clean File";

  return (
    <div className="theme-report min-h-screen -m-6 p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/results">
            <Button variant="outline" size="icon" className="hover:border-purple-500/50 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" /> {scan.filename}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              VirusTotal Scan ID: {scan.id} • {formatDate(scan.uploadedAt)}
            </p>
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-2">
          <Button variant="cyber" size="sm" onClick={handleExportHTML} className="gap-1.5 font-mono text-xs shadow-md">
            <FileText className="w-3.5 h-3.5" /> Download HTML Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-1.5 font-mono text-xs">
            <Download className="w-3.5 h-3.5" /> Export JSON Report
          </Button>
          {scan.fileDataUrl && (
            <Button variant="outline" size="sm" onClick={handleDownloadFile} className="gap-1.5 font-mono text-xs text-cyan-400 border-cyan-500/30">
              <Download className="w-3.5 h-3.5" /> Download Analyzed File
            </Button>
          )}
        </div>
      </div>

      {/* System & Device Harm Risk Panel */}
      {scan.systemHarmAssessment && (
        <SystemHarmCard assessment={scan.systemHarmAssessment} />
      )}

      {/* VirusTotal Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Ratio Gauge Card */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-900"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={376}
                strokeDashoffset={376 - (376 * (detectionRatio.malicious + detectionRatio.suspicious)) / detectionRatio.total}
                className={detectionRatio.malicious > 0 ? "text-rose-500" : detectionRatio.suspicious > 0 ? "text-amber-500" : "text-emerald-500"}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold font-mono ${detectionRatio.malicious > 0 ? "text-rose-400" : detectionRatio.suspicious > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {detectionRatio.malicious} / {detectionRatio.total}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Vendors</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className={`text-base font-extrabold font-mono ${detectionRatio.malicious > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {detectionRatio.malicious > 0 ? "Flagged as Malicious" : "Clean File Verified"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Classification: <span className="text-cyan-300 font-semibold">{virusCategory}</span>
            </p>
          </div>
        </div>

        {/* File Priority & Cryptographic Details */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Analysis Priority:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-extrabold border ${
                virusPriority === 'P1-CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : virusPriority === 'P2-HIGH'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                  : virusPriority === 'P3-MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              }`}>
                <Flame className="w-3.5 h-3.5 inline mr-1" /> {virusPriority}
              </span>
            </div>

            <VerdictBadge status={scan.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Size</span>
              <span className="font-bold text-slate-200">{formatBytes(scan.filesize)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Format</span>
              <span className="font-bold text-cyan-300 truncate block">{scan.detectedFormat}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Shannon Entropy</span>
              <span className={`font-bold ${scan.entropy > 7.2 ? "text-amber-400" : "text-emerald-400"}`}>
                {scan.entropy ? scan.entropy.toFixed(2) : "3.40"} / 8.0
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">IoC Indicators</span>
              <span className="font-bold text-cyan-400">{(scan.extractedIoCs || []).length} Found</span>
            </div>
          </div>

          {/* Cryptographic Hashes Bar */}
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">SHA-256</span>
                <span className="text-cyan-300 text-[11px] truncate">{scan.sha256}</span>
              </div>
              <button
                onClick={() => handleCopyHash(scan.sha256, "SHA-256")}
                className="text-slate-400 hover:text-cyan-300 transition-colors shrink-0"
              >
                {copiedHash === "SHA-256" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {scan.md5 && (
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">MD5</span>
                  <span className="text-cyan-300 text-[11px] truncate">{scan.md5}</span>
                </div>
                <button
                  onClick={() => handleCopyHash(scan.md5, "MD5")}
                  className="text-slate-400 hover:text-cyan-300 transition-colors shrink-0"
                >
                  {copiedHash === "MD5" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: "vendors", label: `72 Security Vendors`, icon: <ShieldAlert className="w-4 h-4" /> },
            { id: "intel", label: "Multi-Platform Virus Reports (8 Sites)", icon: <Globe className="w-4 h-4" /> },
            { id: "output", label: "File Output & Preview", icon: <Eye className="w-4 h-4" /> },
            { id: "checks", label: `Static Security Checks (${scan.checks.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
            { id: "remediation", label: "Remediation Guides", icon: <Code2 className="w-4 h-4" /> },
            { id: "hex", label: "Binary Magic Bytes", icon: <Terminal className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        {activeTab === "checks" && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 mr-1">Filter:</span>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-2.5 py-1 rounded border transition-colors ${filterStatus === "ALL" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
            >
              ALL ({scan.checks.length})
            </button>
            <button
              onClick={() => setFilterStatus("FAIL")}
              className={`px-2.5 py-1 rounded border transition-colors ${filterStatus === "FAIL" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
            >
              FAILS ({scan.failCount})
            </button>
            <button
              onClick={() => setFilterStatus("PASS")}
              className={`px-2.5 py-1 rounded border transition-colors ${filterStatus === "PASS" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
            >
              PASSED ({scan.passCount})
            </button>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === "vendors" && (
        <VendorGrid
          vendorResults={scan.vendorResults || []}
          detectionRatio={detectionRatio}
        />
      )}

      {activeTab === "intel" && (
        <ThreatIntelTab reports={scan.multiPlatformReports || []} />
      )}

      {activeTab === "output" && (
        <FileOutputViewer
          filename={scan.filename}
          extension={scan.extension}
          mimeType={scan.mimeType}
          fileTextPreview={scan.fileTextPreview}
          fileDataUrl={scan.fileDataUrl}
          extractedIoCs={scan.extractedIoCs || []}
        />
      )}

      {activeTab === "checks" && (
        <div className="space-y-3">
          {filteredChecks.map((check) => (
            <CheckCard key={check.id} check={check} />
          ))}
        </div>
      )}

      {activeTab === "remediation" && (
        <RemediationTab cweId={scan.checks.find(c => c.status === 'FAIL')?.cwe || 'CWE-434'} />
      )}

      {activeTab === "hex" && (
        <HexViewer hexString={scan.magicBytesHex} />
      )}
    </div>
  );
}
