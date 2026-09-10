"use client";

import { useState } from "react";
import { CWE_DATABASE } from "@/lib/cwe-database";
import { Tabs } from "@/components/ui/tabs";
import { Copy, Check, Code2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RemediationTab({ cweId = 'CWE-434' }: { cweId?: string }) {
  const [activeCweId, setActiveCweId] = useState<string>(
    CWE_DATABASE[cweId] ? cweId : 'CWE-434'
  );
  const [lang, setLang] = useState<'nodejs' | 'python' | 'java' | 'php'>('nodejs');
  const [copied, setCopied] = useState(false);

  const cweData = CWE_DATABASE[activeCweId] || CWE_DATABASE['CWE-434'];
  const codeSnippet = cweData.codeSnippets[lang];

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableCwes = Object.keys(CWE_DATABASE);

  return (
    <div className="space-y-4">
      {/* CWE Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mr-2">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Vulnerability Guides:
        </span>
        {availableCwes.map((id) => (
          <button
            key={id}
            onClick={() => setActiveCweId(id)}
            className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
              activeCweId === id
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md font-bold"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {id}: {CWE_DATABASE[id].name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-cyan-400 font-mono flex items-center gap-2">
            <Code2 className="w-4 h-4" /> {cweData.id}: {cweData.name}
          </h4>
          <span className="text-[11px] font-mono text-slate-400 border border-slate-800 px-2 py-0.5 rounded bg-slate-900">
            {cweData.title}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{cweData.description}</p>
        <div className="pt-2 text-[11px] font-mono text-rose-400 flex items-center gap-1">
          <span className="font-bold text-slate-400">Risk & Impact:</span> {cweData.riskImpact}
        </div>
      </div>

      {/* Language Switcher & Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'nodejs', label: 'Node.js / Express' },
            { id: 'python', label: 'Python / Flask' },
            { id: 'java', label: 'Java / Spring' },
            { id: 'php', label: 'PHP' },
          ]}
          activeTab={lang}
          onChange={(id) => setLang(id as any)}
        />

        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 font-mono text-xs shrink-0">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Fix Code"}</span>
        </Button>
      </div>

      {/* Code Block */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto text-cyan-300 leading-relaxed shadow-inner">
        <pre>{codeSnippet}</pre>
      </div>
    </div>
  );
}
