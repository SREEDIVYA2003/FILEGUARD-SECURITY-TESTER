"use client";

import { useState } from "react";
import { ExtractedIoC } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, FileText, Image as ImageIcon, Eye, ShieldAlert, Terminal, Copy, Check } from "lucide-react";

interface FileOutputViewerProps {
  filename: string;
  extension: string;
  mimeType: string;
  fileTextPreview?: string;
  fileDataUrl?: string;
  extractedIoCs: ExtractedIoC[];
}

export function FileOutputViewer({
  filename,
  extension,
  mimeType,
  fileTextPreview,
  fileDataUrl,
  extractedIoCs
}: FileOutputViewerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"text" | "image" | "iocs">("text");
  const [copied, setCopied] = useState(false);

  const isImage = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(extension.toLowerCase()) || mimeType.includes('image');

  const handleCopyText = () => {
    if (fileTextPreview) {
      navigator.clipboard.writeText(fileTextPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeSubTab === "text" ? "cyber" : "outline"}
            size="sm"
            onClick={() => setActiveSubTab("text")}
            className="gap-2 text-xs font-mono"
          >
            <FileText className="w-3.5 h-3.5" /> Text / Code Output
          </Button>

          {isImage && (
            <Button
              variant={activeSubTab === "image" ? "cyber" : "outline"}
              size="sm"
              onClick={() => setActiveSubTab("image")}
              className="gap-2 text-xs font-mono"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Graphic Preview
            </Button>
          )}

          <Button
            variant={activeSubTab === "iocs" ? "cyber" : "outline"}
            size="sm"
            onClick={() => setActiveSubTab("iocs")}
            className="gap-2 text-xs font-mono"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Extracted Indicators ({extractedIoCs.length})
          </Button>
        </div>

        {activeSubTab === "text" && fileTextPreview && (
          <Button variant="outline" size="sm" onClick={handleCopyText} className="gap-1.5 text-xs font-mono">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Raw Output"}
          </Button>
        )}
      </div>

      {/* Sub-Tab 1: Text / Code Preview */}
      {activeSubTab === "text" && (
        <Card className="p-4 bg-slate-950/90 border-slate-800 font-mono">
          {fileTextPreview ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                <span>File Output Content Stream: {filename}</span>
                <span className="text-[10px] text-cyan-400">Sanitized ASCII/UTF-8</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-lg overflow-x-auto text-xs text-slate-300 leading-relaxed border border-slate-800 max-h-[400px]">
                <pre className="whitespace-pre-wrap break-all">
                  {fileTextPreview.split('\n').map((line, idx) => {
                    const isThreatLine = /eval|system|passthru|shell_exec|script|onload|onerror|eicar|cmd\.exe|powershell/i.test(line);
                    return (
                      <div key={idx} className={`flex gap-4 px-2 py-0.5 rounded ${isThreatLine ? "bg-rose-500/10 border-l-2 border-rose-500 text-rose-200 font-semibold" : "hover:bg-slate-800/40"}`}>
                        <span className="text-slate-600 select-none w-8 text-right shrink-0">{idx + 1}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    );
                  })}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Code className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No printable text content found in binary executable stream.</p>
            </div>
          )}
        </Card>
      )}

      {/* Sub-Tab 2: Graphic / Image Preview */}
      {activeSubTab === "image" && isImage && (
        <Card className="p-6 bg-slate-950/90 border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
          {fileDataUrl ? (
            <div className="space-y-4 text-center">
              <div className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 inline-block shadow-2xl">
                <img
                  src={fileDataUrl}
                  alt={filename}
                  className="max-h-[320px] max-w-full rounded object-contain mx-auto"
                />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Format: <span className="text-cyan-400 font-bold uppercase">{extension}</span> | Data URL Verified
              </p>
            </div>
          ) : (
            <div className="text-center text-slate-500 space-y-2">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Image preview unavailable (Data URL omitted for size policy).</p>
            </div>
          )}
        </Card>
      )}

      {/* Sub-Tab 3: Extracted IoCs */}
      {activeSubTab === "iocs" && (
        <Card className="p-4 bg-slate-950/90 border-slate-800 font-mono">
          <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" /> Extracted Network & Execution Indicators ({extractedIoCs.length})
          </h4>

          {extractedIoCs.length > 0 ? (
            <div className="space-y-2">
              {extractedIoCs.map((ioc, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    ioc.risk === 'HIGH'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                      : ioc.risk === 'MEDIUM'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 border border-slate-700">
                        {ioc.type}
                      </span>
                      <span className="font-bold">{ioc.value}</span>
                    </div>
                    {ioc.context && (
                      <p className="text-[11px] text-slate-400">{ioc.context}</p>
                    )}
                  </div>

                  <Badge variant={ioc.risk === 'HIGH' ? 'critical' : ioc.risk === 'MEDIUM' ? 'warning' : 'outline'}>
                    {ioc.risk} RISK
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Eye className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No active network IoCs, IPs, or shell primitives extracted.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
