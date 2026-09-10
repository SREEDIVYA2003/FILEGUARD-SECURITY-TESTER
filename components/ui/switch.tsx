import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, label, description, disabled = false }: SwitchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      {(label || description) && (
        <div className="flex flex-col pr-4">
          {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
          {description && <span className="text-xs text-slate-400">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50",
          checked ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-slate-800 border-slate-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5 bg-slate-950" : "translate-x-0 bg-slate-400"
          )}
        />
      </button>
    </div>
  );
}
