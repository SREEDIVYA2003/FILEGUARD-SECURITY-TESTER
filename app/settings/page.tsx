"use client";

import { useEffect, useState } from "react";
import { SecurityRuleset } from "@/types";
import { getStoredRuleset, saveRuleset, resetToMockData } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Settings, Save, RotateCcw, ShieldCheck, HardDrive, FileCheck2, Cpu } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [ruleset, setRuleset] = useState<SecurityRuleset | null>(null);

  useEffect(() => {
    setRuleset(getStoredRuleset());
  }, []);

  if (!ruleset) return null;

  const handleSave = () => {
    saveRuleset(ruleset);
    toast({
      type: 'success',
      title: 'Security Policy Updated',
      description: 'New file inspection rules have been applied to future scans.'
    });
  };

  const handleResetData = () => {
    resetToMockData();
    setRuleset(getStoredRuleset());
    toast({
      type: 'info',
      title: 'Demo Data Reset',
      description: 'Audit logs and scans have been restored to initial sample state.'
    });
  };

  return (
    <div className="theme-settings min-h-screen -m-6 p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Security Policy & Ruleset Config</span>
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Customize static check thresholds, ruleset strictness, and local sandbox preferences.
          </p>
        </div>


        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetData} className="gap-1.5 text-xs font-mono">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Mock Data
          </Button>
          <Button variant="cyber" size="sm" onClick={handleSave} className="gap-1.5 text-xs font-mono">
            <Save className="w-3.5 h-3.5" /> Save Policies
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Upload Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-cyan-400 font-mono">
              <HardDrive className="w-4 h-4" /> Upload Limits & Thresholds
            </CardTitle>
            <CardDescription>Configure file size boundary parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-800">
              <div>
                <label className="text-sm font-semibold text-slate-200 block">Max File Size Limit (MB)</label>
                <span className="text-xs text-slate-400">Files exceeding this size will trigger an OVERSIZED FAIL alert.</span>
              </div>
              <input
                type="number"
                value={ruleset.maxFileSizeMB}
                onChange={(e) => setRuleset({ ...ruleset, maxFileSizeMB: parseInt(e.target.value) || 10 })}
                className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="py-2">
              <label className="text-sm font-semibold text-slate-200 block mb-1">Allowed Extensions Whitelist</label>
              <input
                type="text"
                value={ruleset.allowedExtensions.join(', ')}
                onChange={(e) => setRuleset({ ...ruleset, allowedExtensions: e.target.value.split(',').map(s => s.trim().toLowerCase()) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="png, jpg, pdf, docx..."
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Comma-separated extension list for safe file policy.</span>
            </div>
          </CardContent>
        </Card>

        {/* VirusTotal API Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-cyan-400 font-mono">
              <Cpu className="w-4 h-4" /> VirusTotal v3 Threat Intelligence API
            </CardTitle>
            <CardDescription>Configure your VirusTotal API key or threat intelligence lookups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-2">
              <label className="text-sm font-semibold text-slate-200 block mb-1">VirusTotal API Key (Optional)</label>
              <input
                type="password"
                value={ruleset.virusTotalApiKey || ''}
                onChange={(e) => setRuleset({ ...ruleset, virusTotalApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="Enter your VirusTotal API key (e.g. 64-character hex string)..."
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                When left empty, the engine uses MalwareBazaar API and CIRCL Hashlookup API with 72 simulated antimalware vendor rules.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Static Security Rules Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-cyan-400 font-mono">
              <ShieldCheck className="w-4 h-4" /> Active Static Security Rules
            </CardTitle>
            <CardDescription>Enable or disable specific security checks in the static engine.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-800/60">
            <Switch
              label="Dangerous Extension Check"
              description="Flag .exe, .php, .jsp, .asp, .sh, .py executable extensions."
              checked={ruleset.checkDangerousExt}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkDangerousExt: val })}
            />
            <Switch
              label="Double Extension Evasion Detection"
              description="Detect compound extension tricks like avatar.jpg.php."
              checked={ruleset.checkDoubleExt}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkDoubleExt: val })}
            />
            <Switch
              label="MIME Type Discrepancy Check"
              description="Compare HTTP Content-Type header with file extension."
              checked={ruleset.checkMimeMismatch}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkMimeMismatch: val })}
            />
            <Switch
              label="Binary Magic Byte Inspector"
              description="Extract header bytes to verify authentic file signature."
              checked={ruleset.checkMagicMismatch}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkMagicMismatch: val })}
            />
            <Switch
              label="Suspicious Filename & Null-Byte Check"
              description="Detect null bytes (%00), shell symbols, and Windows reserved names."
              checked={ruleset.checkSuspiciousFilename}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkSuspiciousFilename: val })}
            />
            <Switch
              label="Path Traversal Detection"
              description="Flag relative traversal sequences (../, ..\\)."
              checked={ruleset.checkPathTraversal}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkPathTraversal: val })}
            />
            <Switch
              label="Unicode & Homoglyph Anomaly Check"
              description="Detect Right-to-Left Override (\u202E) and non-ASCII character spoofs."
              checked={ruleset.checkUnicodeAnomalies}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkUnicodeAnomalies: val })}
            />
            <Switch
              label="SVG & XML XSS / XXE Inspector"
              description="Inspect SVG and XML text for embedded <script> and XML entity loops."
              checked={ruleset.checkSvgXmlXss}
              onCheckedChange={(val) => setRuleset({ ...ruleset, checkSvgXmlXss: val })}
            />
            <Switch
              label="Strict Mode Enforcement"
              description="Elevate warning severity on minor discrepancies."
              checked={ruleset.strictMode}
              onCheckedChange={(val) => setRuleset({ ...ruleset, strictMode: val })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
