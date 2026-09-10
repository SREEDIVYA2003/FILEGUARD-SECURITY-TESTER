"use client";

import Link from "next/link";
import { Search, Bell, Shield, ArrowUpRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search scans, rules, CWEs..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
        />
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-4">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Local Sandbox</span>
        </div>

        {/* Quick Launch CTA */}
        <Link href="/analyzer">
          <Button variant="cyber" size="sm">
            <span>New File Scan</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
