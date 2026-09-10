"use client";

import { useState } from "react";
import { VendorResult } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle, Search } from "lucide-react";

interface VendorGridProps {
  vendorResults: VendorResult[];
  detectionRatio: { malicious: number; suspicious: number; clean: number; total: number };
}

export function VendorGrid({ vendorResults, detectionRatio }: VendorGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "malicious" | "suspicious" | "clean">("ALL");

  const filteredVendors = vendorResults.filter(vendor => {
    const matchesSearch = vendor.engineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.result && vendor.result.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterCategory === "ALL") return matchesSearch;
    return matchesSearch && vendor.category === filterCategory;
  });

  return (
    <div className="space-y-4">
      {/* Control Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search security engine (e.g. Kaspersky, Microsoft)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 mr-1">Filter:</span>
          <button
            onClick={() => setFilterCategory("ALL")}
            className={`px-2.5 py-1 rounded border transition-colors ${filterCategory === "ALL" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            ALL ({detectionRatio.total})
          </button>
          <button
            onClick={() => setFilterCategory("malicious")}
            className={`px-2.5 py-1 rounded border transition-colors ${filterCategory === "malicious" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            MALICIOUS ({detectionRatio.malicious})
          </button>
          <button
            onClick={() => setFilterCategory("suspicious")}
            className={`px-2.5 py-1 rounded border transition-colors ${filterCategory === "suspicious" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            SUSPICIOUS ({detectionRatio.suspicious})
          </button>
          <button
            onClick={() => setFilterCategory("clean")}
            className={`px-2.5 py-1 rounded border transition-colors ${filterCategory === "clean" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            CLEAN ({detectionRatio.clean})
          </button>
        </div>
      </div>

      {/* Security Vendors 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVendors.map((vendor, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
              vendor.category === 'malicious'
                ? 'bg-rose-950/20 border-rose-500/30'
                : vendor.category === 'suspicious'
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                vendor.category === 'malicious'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : vendor.category === 'suspicious'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {vendor.category === 'malicious' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : vendor.category === 'suspicious' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-200 block font-mono">{vendor.engineName}</span>
                <span className={`text-[11px] font-mono block ${
                  vendor.category === 'malicious'
                    ? 'text-rose-400 font-semibold'
                    : vendor.category === 'suspicious'
                    ? 'text-amber-400'
                    : 'text-slate-500'
                }`}>
                  {vendor.result || 'Undetected'}
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-slate-500 space-y-0.5">
              <span>{vendor.engineVersion || 'v14.2'}</span>
              <span className="block text-slate-600">Updated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
