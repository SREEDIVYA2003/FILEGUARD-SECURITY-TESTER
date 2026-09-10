"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileAnalysis } from "@/types";
import { getStoredScans, deleteScan } from "@/lib/storage";
import { RecentScans } from "@/components/dashboard/recent-scans";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, ShieldCheck } from "lucide-react";

export default function ResultsListPage() {
  const [scans, setScans] = useState<FileAnalysis[]>([]);

  useEffect(() => {
    setScans(getStoredScans());
  }, []);

  const handleDelete = (id: string) => {
    const updated = deleteScan(id);
    setScans(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" /> Scan Audit Results
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Historical security audit reports for analyzed local files.
          </p>
        </div>

        <Link href="/analyzer">
          <Button variant="cyber" size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Analysis
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <RecentScans scans={scans} onDeleteScan={handleDelete} />
      </Card>
    </div>
  );
}
