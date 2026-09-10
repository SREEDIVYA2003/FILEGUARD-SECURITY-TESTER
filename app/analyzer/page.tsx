"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileAnalysis } from "@/types";
import { runSecurityAnalysis } from "@/lib/security-analyzer";
import { getStoredRuleset, saveScan } from "@/lib/storage";
import { FileDropzone } from "@/components/analyzer/file-dropzone";
import { FilePreview } from "@/components/analyzer/file-preview";
import { CheckProgress } from "@/components/analyzer/check-progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ShieldCheck, RefreshCw, ArrowRight, FileCheck2, AlertCircle } from "lucide-react";

export default function FileAnalyzerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FileAnalysis | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setAnalyzing(true);

    try {
      const buffer = await file.arrayBuffer();
      const ruleset = getStoredRuleset();
      const result = await runSecurityAnalysis(file, buffer, ruleset);
      
      // Delay slightly for smooth scan progress UX
      setTimeout(() => {
        setAnalysisResult(result);
        saveScan(result);
        setAnalyzing(false);

        toast({
          type: result.status === 'CLEAN' ? 'success' : result.status === 'CRITICAL' ? 'error' : 'warning',
          title: `Scan Completed for ${file.name}`,
          description: `Score: ${result.score}/100 - Status: ${result.status}`
        });
      }, 1500);

    } catch (e: any) {
      setAnalyzing(false);
      toast({
        type: 'error',
        title: 'Analysis Error',
        description: e.message || 'Failed to read file buffer safely.'
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="theme-analyzer min-h-screen -m-6 p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <FileCheck2 className="w-3.5 h-3.5" /> Client-Side Safe Inspection Engine
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
          <span>File Security Analyzer</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-sans">
          Upload any local document, binary, image, or script to run 10 static security checks without payload execution.
        </p>
      </div>

      {/* Main Dropzone / Inspection State */}
      {!selectedFile && (
        <FileDropzone onFileSelect={handleFileSelect} />
      )}

      {/* Scanning In Progress */}
      {selectedFile && analyzing && (
        <CheckProgress onComplete={() => {}} />
      )}

      {/* Analysis Result */}
      {selectedFile && analysisResult && !analyzing && (
        <div className="space-y-6">
          <FilePreview analysis={analysisResult} />

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-xl">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Scan Another File</span>
            </Button>

            <Button
              variant="cyber"
              onClick={() => router.push(`/results/${analysisResult.id}`)}
              className="gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)]"
            >
              <span>View Full Report & Fixes</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Security Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300 shadow-lg">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          <strong>Safe Inspection Guarantee:</strong> All checks (magic bytes, SHA-256 digests, extension verification, path traversal, Unicode, SVG XSS inspection) are evaluated purely in local memory. Files are never uploaded to external servers or executed.
        </p>
      </div>
    </div>
  );

}
