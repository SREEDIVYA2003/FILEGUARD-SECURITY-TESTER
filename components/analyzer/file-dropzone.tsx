"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileSelect, disabled = false }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "relative overflow-hidden cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 backdrop-blur-md group",
        isDragOver
          ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_40px_rgba(0,242,254,0.3)] scale-[1.01]"
          : "border-cyan-500/30 bg-slate-950/80 hover:border-cyan-400 hover:bg-slate-900/70 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
      )}
    >
      {/* Animated Radar Sweep Radar Layer */}
      <div className="radar-sweep opacity-30 group-hover:opacity-60 transition-opacity" />

      {/* Animated Top-to-Bottom Scanning Line */}
      <div className="scanline-animated" />

      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        {/* Animated Cyber Ring Icon */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900/90 border border-cyan-400/50 group-hover:border-cyan-300 group-hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all">
          <UploadCloud className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-40" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            Drag & Drop file to inspect or <span className="text-cyan-400 underline decoration-cyan-500/50 underline-offset-4">Browse Local Storage</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
            Supports PNG, JPEG, PDF, SVG, DOCX, ZIP, EXE, PHP, Script files for safe static inspection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-900/90 px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Non-destructive Client Sandbox Inspection Active</span>
        </div>
      </div>
    </div>
  );

}
