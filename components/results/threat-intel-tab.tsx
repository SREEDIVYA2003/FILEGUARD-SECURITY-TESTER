"use client";

import { PlatformReport } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, ExternalLink, Globe, Cpu, Database, Activity, Box, Lock, CheckCircle } from "lucide-react";

interface ThreatIntelTabProps {
  reports: PlatformReport[];
}

export function ThreatIntelTab({ reports }: ThreatIntelTabProps) {
  const iconMap: Record<string, any> = {
    ShieldAlert,
    Cpu,
    Database,
    Activity,
    Box,
    Lock,
    Globe,
    CheckCircle
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" /> Global Multi-Platform Virus & Sandbox Reports
          </h3>
          <p className="text-xs text-slate-400">
            Real-time threat intelligence verdicts from 8 major global security platforms.
          </p>
        </div>

        <Badge variant="cyan">8 Platforms Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, idx) => {
          const IconComponent = iconMap[report.platformIcon] || Globe;
          const isMalicious = report.verdict === 'MALICIOUS';
          const isSuspicious = report.verdict === 'SUSPICIOUS';

          return (
            <Card
              key={idx}
              className={`p-5 border rounded-xl space-y-3 transition-all ${
                isMalicious
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/80'
                  : isSuspicious
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/80'
                  : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isMalicious
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : isSuspicious
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100">{report.platformName}</h4>
                    <span className="text-[11px] text-cyan-400">{report.category}</span>
                  </div>
                </div>

                <Badge variant={isMalicious ? "critical" : isSuspicious ? "warning" : "pass"}>
                  {report.score}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                {report.details}
              </p>

              {report.linkUrl && (
                <div className="pt-1 flex items-center justify-end">
                  <a
                    href={report.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-200 transition-colors"
                  >
                    View Live Site Report <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
