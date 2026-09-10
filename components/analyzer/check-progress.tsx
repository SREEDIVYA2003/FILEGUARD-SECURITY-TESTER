"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Cpu, Hash, FileCode, CheckCircle2 } from "lucide-react";

interface CheckProgressProps {
  onComplete: () => void;
}

export function CheckProgress({ onComplete }: CheckProgressProps) {
  const [progress, setProgress] = useState(10);
  const [step, setStep] = useState("Computing SHA-256 Digest...");

  useEffect(() => {
    const steps = [
      { p: 25, label: "Reading Binary Header Magic Bytes..." },
      { p: 50, label: "Scanning Extension & MIME Discrepancies..." },
      { p: 75, label: "Running Traversal & Null-Byte Rules..." },
      { p: 90, label: "Inspecting SVG/XML Script Handlers..." },
      { p: 100, label: "Finalizing Security Verdict..." },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStep(steps[currentStep].label);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="p-8 border border-cyan-500/30 rounded-2xl bg-slate-950/90 text-center space-y-6 shadow-[0_0_30px_rgba(0,242,254,0.15)]">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <ShieldCheck className="w-8 h-8 text-cyan-400" />
      </div>

      <div className="space-y-2">
        <h4 className="text-base font-bold text-slate-100 font-mono tracking-wide">{step}</h4>
        <p className="text-xs text-slate-400 font-mono">Executing safe client-side static security rules...</p>
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <Progress value={progress} color="cyan" />
        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span>Static Analysis</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
