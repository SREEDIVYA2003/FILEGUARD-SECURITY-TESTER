"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  FileCheck2,
  FileText,
  AlertTriangle,
  Settings,
  ChevronRight,
  ShieldCheck,
  Zap,
  FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Demo Testing",
    href: "/demo",
    icon: FlaskConical,
    badge: "DEMO"
  },
  {
    name: "File Analyzer",
    href: "/analyzer",
    icon: FileCheck2,
    badge: "LIVE"
  },
  {
    name: "Scan Results",
    href: "/results",
    icon: FileText,
  },
  {
    name: "Findings",
    href: "/findings",
    icon: AlertTriangle,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex flex-col min-h-screen z-30">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,242,254,0.4)]">
          <ShieldAlert className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            FILEGUARD
          </span>
          <span className="text-[10px] tracking-widest uppercase text-slate-400 font-mono">
            SECURITY TESTER
          </span>
        </div>
      </div>

      {/* Engine Status Card */}
      <div className="mx-4 mt-5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            Engine: Active <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
          </span>
          <span className="text-[11px] text-slate-400">Ruleset v2.4 (Static)</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          // Theme color mapping per route
          const themeStyleMap: Record<string, { active: string; icon: string }> = {
            "/": {
              active: "bg-gradient-to-r from-rose-500/20 via-cyan-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-[0_0_15px_rgba(0,242,254,0.15)]",
              icon: "text-cyan-400"
            },
            "/demo": {
              active: "bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-300 border-l-2 border-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]",
              icon: "text-emerald-400"
            },
            "/analyzer": {
              active: "bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]",
              icon: "text-cyan-400"
            },
            "/results": {
              active: "bg-gradient-to-r from-sky-500/20 to-transparent text-sky-300 border-l-2 border-sky-400 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.15)]",
              icon: "text-sky-400"
            },
            "/findings": {
              active: "bg-gradient-to-r from-amber-500/20 to-transparent text-amber-300 border-l-2 border-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]",
              icon: "text-amber-400"
            },
            "/settings": {
              active: "bg-gradient-to-r from-slate-700/40 to-transparent text-slate-200 border-l-2 border-cyan-400 font-semibold",
              icon: "text-cyan-400"
            }
          };

          const theme = themeStyleMap[item.href] || { active: "bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400", icon: "text-cyan-400" };

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? theme.active
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? theme.icon : "text-slate-400 group-hover:text-slate-200")} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight className={cn("w-4 h-4 animate-pulse", theme.icon)} />
              )}
            </Link>
          );
        })}
      </nav>


      {/* Compliance / Safe Mode Footer Card */}
      <div className="p-4 m-3 rounded-lg bg-slate-900/60 border border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-1">
          <Zap className="w-4 h-4 text-cyan-400" /> Authorized Mode
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Non-destructive static file inspection. Zero remote server execution.
        </p>
      </div>
    </aside>
  );
}
