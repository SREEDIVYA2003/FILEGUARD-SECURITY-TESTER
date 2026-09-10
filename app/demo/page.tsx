"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runSecurityAnalysis } from "@/lib/security-analyzer";
import { saveScan, getStoredRuleset } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  FlaskConical,
  ShieldAlert,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Play,
  Zap,
  Loader2,
  HardDrive,
  Globe,
  Flame
} from "lucide-react";

interface DemoSample {
  id: string;
  name: string;
  filename: string;
  type: string;
  size: string;
  category: string;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE";
  harmLevel: string;
  description: string;
  expectedVerdict: string;
  multiSitePreview: string;
  content: string;
}

const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "sample-wannacry",
    name: "WannaCry Ransomware PE Executable",
    filename: "WannaCry_Invoice_Receipt.pdf.exe",
    type: "application/x-dosexec",
    size: "1.8 MB",
    category: "File Encrypting Ransomware",
    threatLevel: "CRITICAL",
    harmLevel: "CRITICAL DEVICE DAMAGE",
    description: "Executable PE MZ payload with 7.84 high Shannon entropy. Encrypts hard drive files (.locked) and corrupts boot records.",
    expectedVerdict: "68 / 72 Security Vendors Flagged",
    multiSitePreview: "VirusTotal: 68/72 | Hybrid: 100/100 | JOE Sandbox: 98/100 | MalwareBazaar: Matched",
    content: `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\xb8\x00\x00\x00\x00\x00\x00\x00@\x00\x00\x00
[HIGH ENTROPY PACKED PAYLOAD - WANNA CRY RANSOMWARE ENCRYPTION ROUTINE]`
  },
  {
    id: "sample-emotet",
    name: "Emotet Banking Trojan & Keylogger",
    filename: "Bank_Transfer_Notice.docm",
    type: "application/vnd.ms-word.document.macroEnabled.12",
    size: "820 KB",
    category: "Banking Trojan / Keylogger",
    threatLevel: "CRITICAL",
    harmLevel: "HIGH SYSTEM RISK",
    description: "Macro-enabled document containing obfuscatd AutoOpen VBA macro scripts designed to steal browser passwords and keystrokes.",
    expectedVerdict: "62 / 72 Security Vendors Flagged",
    multiSitePreview: "VirusTotal: 62/72 | ANY.RUN: High Threat | Cisco Talos: Blacklisted | MetaDefender: Failed",
    content: `PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00
[VBA MACRO PAYLOAD - EMOTET BANKING TROJAN CREDENTIAL HARVESTER]`
  },
  {
    id: "sample-agenttesla",
    name: "AgentTesla Spyware Stealer",
    filename: "Shipping_Manifest_Track.exe",
    type: "application/x-msdownload",
    size: "950 KB",
    category: "Spyware / Data Exfiltration",
    threatLevel: "CRITICAL",
    harmLevel: "HIGH SYSTEM RISK",
    description: ".NET executable that monitors system clipboard, logs keystrokes, and exfiltrates FTP/SMTP passwords.",
    expectedVerdict: "60 / 72 Security Vendors Flagged",
    multiSitePreview: "VirusTotal: 60/72 | Hybrid: 95/100 | CIRCL: Malicious | JOE Sandbox: 92/100",
    content: `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00
[AGENT TESLA SPYWARE KEYLOGGER AND CREDENTIAL EXFILTRATION BINARY]`
  },
  {
    id: "sample-eicar",
    name: "EICAR Standard AV Test File",
    filename: "eicar_standard_test.com",
    type: "application/x-msdownload",
    size: "68 Bytes",
    category: "Standard Virus Benchmark",
    threatLevel: "CRITICAL",
    harmLevel: "SYNTHETIC TEST BENCHMARK",
    description: "Official EICAR anti-virus test file string. Recognized by 70+ security engines to test scanner response safely.",
    expectedVerdict: "70 / 72 Security Vendors Flagged",
    multiSitePreview: "VirusTotal: 70/72 | MalwareBazaar: Indexed | CIRCL: EICAR Match",
    content: `X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*`
  },
  {
    id: "sample-webshell",
    name: "PHP Webshell PNG Polyglot",
    filename: "avatar_profile.png.php",
    type: "image/png",
    size: "2.4 KB",
    category: "Webshell / Remote Execution",
    threatLevel: "CRITICAL",
    harmLevel: "HIGH SERVER RISK",
    description: "PNG magic byte header combined with embedded PHP webshell payload for remote command execution.",
    expectedVerdict: "58 / 72 Security Vendors Flagged",
    multiSitePreview: "VirusTotal: 58/72 | ANY.RUN: Process Injection | Hybrid: 88/100",
    content: `\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x06\x00\x00\x00\x1f\xf3\xff
<?php
// PHP Polyglot Webshell Demonstration
$cmd = $_GET['cmd'];
?>`
  },
  {
    id: "sample-svg-xss",
    name: "Vector SVG Image XSS Exploit",
    filename: "company_logo_vector.svg",
    type: "image/svg+xml",
    size: "1.1 KB",
    category: "Browser XSS Exploit",
    threatLevel: "MEDIUM",
    harmLevel: "MODERATE BROWSER RISK",
    description: "Vector graphic XML file containing embedded JavaScript script tags and onload event triggers.",
    expectedVerdict: "24 / 72 Security Vendors Flagged",
    multiSitePreview: "VirusTotal: 24/72 | MetaDefender: Failed | JOE Sandbox: 45/100",
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="yellow" />
  <script type="text/javascript">
    alert('SVG XSS Session Hijack Test');
  </script>
</svg>`
  },
  {
    id: "sample-clean-pdf",
    name: "Clean Financial Audit Report",
    filename: "Q3_Financial_Audit_Report.pdf",
    type: "application/pdf",
    size: "420 KB",
    category: "Verified Safe Document",
    threatLevel: "SAFE",
    harmLevel: "SAFE / NO DEVICE HARM",
    description: "Standard PDF 1.7 document structure with valid cross-reference tables and zero embedded script tags.",
    expectedVerdict: "0 / 72 Clean File",
    multiSitePreview: "VirusTotal: 0/72 Clean | Hybrid: 0/100 | CIRCL: Known Good | Talos: Trusted",
    content: `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
trailer
<< /Size 3 /Root 1 0 R >>
%%EOF`
  },
  {
    id: "sample-clean-jpeg",
    name: "Clean EXIF Photo JPEG",
    filename: "profile_avatar_hd.jpg",
    type: "image/jpeg",
    size: "850 KB",
    category: "Verified Safe Image",
    threatLevel: "SAFE",
    harmLevel: "SAFE / NO DEVICE HARM",
    description: "Standard JPEG photo format with valid FF D8 FF E0 magic bytes and EXIF camera metadata.",
    expectedVerdict: "0 / 72 Clean File",
    multiSitePreview: "VirusTotal: 0/72 Clean | MetaDefender: Sanitized | JOE Sandbox: 0/100",
    content: `\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00` + "A".repeat(500)
  }
];

export default function DemoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<string>("");

  const handleRunDemoScan = async (sample: DemoSample) => {
    setAnalyzingId(sample.id);
    setScanStep("Initializing binary memory buffer...");

    try {
      await new Promise(r => setTimeout(r, 400));
      setScanStep("Computing SHA-256, SHA-1, and MD5 hashes...");

      // Convert text string content to ArrayBuffer
      const encoder = new TextEncoder();
      const buffer = encoder.encode(sample.content).buffer;
      const file = new File([buffer], sample.filename, { type: sample.type });

      await new Promise(r => setTimeout(r, 500));
      setScanStep("Querying 8 Security Sites (VirusTotal, Hybrid Analysis, ANY.RUN, MalwareBazaar)...");

      const ruleset = getStoredRuleset();
      const result = await runSecurityAnalysis(file, buffer, ruleset);

      await new Promise(r => setTimeout(r, 600));
      setScanStep("Finalizing System & Device Harm Assessment...");

      saveScan(result);

      toast({
        type: 'success',
        title: 'Multi-Site Security Analysis Complete',
        description: `Generated report for ${sample.filename}`
      });

      router.push(`/results/${result.id}`);
    } catch (e) {
      console.error(e);
      toast({
        type: 'error',
        title: 'Scan Failed',
        description: 'Failed to analyze demo file sample.'
      });
      setAnalyzingId(null);
    }
  };

  return (
    <div className="theme-demo min-h-screen -m-6 p-6 md:p-8 space-y-8 animate-in fade-in duration-500 font-mono">
      {/* Header Banner */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <FlaskConical className="w-3.5 h-3.5" /> Multi-Website Security & Harm Testing Lab
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <FlaskConical className="w-7 h-7 text-emerald-400 animate-pulse" />
              <span>Interactive Virus & System Harm Laboratory</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
              Run 1-click deep security analysis over malicious & clean sample files. Evaluates threat scores across 8 security platforms (VirusTotal, Hybrid Analysis, ANY.RUN, MalwareBazaar) and assesses exact System/Device Harm risks.
            </p>
          </div>
        </div>
      </div>


      {/* Live Scanning Progress Overlay */}
      {analyzingId && (
        <Card className="p-6 bg-slate-950 border-cyan-500/40 space-y-4 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <span className="text-sm font-bold text-slate-200">Querying 8 Security Sites & Sandbox Engines...</span>
            </div>
            <Badge variant="cyan">8 Platforms Active</Badge>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full w-3/4 animate-pulse" />
          </div>
          <p className="text-xs text-cyan-400">{scanStep}</p>
        </Card>
      )}

      {/* Demo Samples Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-cyan-400" /> Interactive Sample Files Suite (Malicious & Clean)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_SAMPLES.map((sample) => (
            <Card
              key={sample.id}
              className={`p-5 border flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] ${
                sample.threatLevel === 'CRITICAL'
                  ? 'bg-rose-950/10 border-rose-500/30 hover:border-rose-500/60'
                  : sample.threatLevel === 'MEDIUM'
                  ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {sample.category}
                  </span>
                  <Badge variant={sample.threatLevel === 'CRITICAL' ? 'critical' : sample.threatLevel === 'MEDIUM' ? 'warning' : 'pass'}>
                    {sample.threatLevel}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" /> {sample.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">Filename: {sample.filename}</p>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {sample.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 uppercase">Device Harm Rating:</span>
                    <span className={`font-bold ${sample.threatLevel === 'CRITICAL' ? 'text-rose-400' : sample.threatLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {sample.harmLevel}
                    </span>
                  </div>
                  <div className="text-cyan-300 text-[10px] truncate">
                    {sample.multiSitePreview}
                  </div>
                </div>
              </div>

              <Button
                variant={sample.threatLevel === 'CRITICAL' ? 'cyber' : 'outline'}
                size="md"
                onClick={() => handleRunDemoScan(sample)}
                disabled={analyzingId !== null}
                className="w-full gap-2 text-xs mt-2"
              >
                {analyzingId === sample.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Run Multi-Site Scan
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
