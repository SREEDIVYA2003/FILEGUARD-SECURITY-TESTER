import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: React.ReactNode; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none select-none",
              isActive
                ? "bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,254,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
