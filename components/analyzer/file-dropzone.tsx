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
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 backdrop-blur-md group",
        isDragOver
          ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,242,254,0.25)] scale-[1.01]"
          : "border-slate-800 bg-slate-950/70 hover:border-cyan-500/40 hover:bg-slate-900/60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Animated Cyber Ring Icon */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all">
          <UploadCloud className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-30" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            Drag & Drop file to analyze or <span className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4">Browse Local Storage</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Supports PNG, JPEG, PDF, SVG, DOCX, ZIP, EXE, PHP, Script files for safe static inspection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Non-destructive Client Sandbox Inspection</span>
        </div>
      </div>
    </div>
  );
}
