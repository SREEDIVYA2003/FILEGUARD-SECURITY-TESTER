import { FileAnalysis, Finding, SecurityRuleset, MetricSummary } from "@/types";
import { DEFAULT_RULESET, INITIAL_MOCK_SCANS, INITIAL_MOCK_FINDINGS } from "./mock-scans-data";
import { enrichScanWithReports } from "./enrich-scan";

const SCANS_KEY = "fileguard_scans_v1";
const FINDINGS_KEY = "fileguard_findings_v1";
const RULESET_KEY = "fileguard_ruleset_v1";

export function getStoredScans(): FileAnalysis[] {
  if (typeof window === "undefined") return INITIAL_MOCK_SCANS.map(enrichScanWithReports);
  try {
    const raw = localStorage.getItem(SCANS_KEY);
    if (!raw) {
      const enrichedMocks = INITIAL_MOCK_SCANS.map(enrichScanWithReports);
      localStorage.setItem(SCANS_KEY, JSON.stringify(enrichedMocks));
      return enrichedMocks;
    }
    const parsed: FileAnalysis[] = JSON.parse(raw);
    const enriched = parsed.map(enrichScanWithReports);
    localStorage.setItem(SCANS_KEY, JSON.stringify(enriched));
    return enriched;
  } catch (e) {
    console.error("Failed to load scans", e);
    return INITIAL_MOCK_SCANS.map(enrichScanWithReports);
  }
}

export function saveScan(scan: FileAnalysis): FileAnalysis[] {
  const enrichedScan = enrichScanWithReports(scan);
  const scans = getStoredScans();
  const existingIdx = scans.findIndex(s => s.id === enrichedScan.id);
  
  let updated: FileAnalysis[];
  if (existingIdx >= 0) {
    updated = [...scans];
    updated[existingIdx] = enrichedScan;
  } else {
    updated = [enrichedScan, ...scans];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(SCANS_KEY, JSON.stringify(updated));
  }

  // Also auto-generate findings for failed checks
  const existingFindings = getStoredFindings();
  const existingFindingTestNames = new Set(
    existingFindings.filter(f => f.scanId === enrichedScan.id).map(f => f.testName)
  );

  const newFindings: Finding[] = enrichedScan.checks
    .filter(c => c.status === 'FAIL' && !existingFindingTestNames.has(c.name))
    .map(c => ({
      id: `find-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      scanId: enrichedScan.id,
      filename: enrichedScan.filename,
      testName: c.name,
      category: c.category,
      severity: c.severity,
      status: 'OPEN',
      cwe: c.cwe || 'CWE-434',
      description: c.description,
      evidence: c.evidence,
      remediation: c.remediation,
      timestamp: enrichedScan.uploadedAt
    }));

  if (newFindings.length > 0) {
    const updatedFindings = [...newFindings, ...existingFindings];
    if (typeof window !== "undefined") {
      localStorage.setItem(FINDINGS_KEY, JSON.stringify(updatedFindings));
    }
  }

  return updated;
}

export function deleteScan(id: string): FileAnalysis[] {
  const scans = getStoredScans().filter(s => s.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(SCANS_KEY, JSON.stringify(scans));
  }
  return scans;
}

export function clearScans(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SCANS_KEY, JSON.stringify([]));
    localStorage.setItem(FINDINGS_KEY, JSON.stringify([]));
  }
}

export function resetToMockData(): { scans: FileAnalysis[]; findings: Finding[] } {
  if (typeof window !== "undefined") {
    localStorage.setItem(SCANS_KEY, JSON.stringify(INITIAL_MOCK_SCANS));
    localStorage.setItem(FINDINGS_KEY, JSON.stringify(INITIAL_MOCK_FINDINGS));
  }
  return { scans: INITIAL_MOCK_SCANS, findings: INITIAL_MOCK_FINDINGS };
}

export function getStoredFindings(): Finding[] {
  if (typeof window === "undefined") return INITIAL_MOCK_FINDINGS;
  try {
    const raw = localStorage.getItem(FINDINGS_KEY);
    if (!raw) {
      localStorage.setItem(FINDINGS_KEY, JSON.stringify(INITIAL_MOCK_FINDINGS));
      return INITIAL_MOCK_FINDINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MOCK_FINDINGS;
  }
}

export function updateFindingStatus(id: string, status: Finding['status']): Finding[] {
  const findings = getStoredFindings().map(f => f.id === id ? { ...f, status } : f);
  if (typeof window !== "undefined") {
    localStorage.setItem(FINDINGS_KEY, JSON.stringify(findings));
  }
  return findings;
}

export function getStoredRuleset(): SecurityRuleset {
  if (typeof window === "undefined") return DEFAULT_RULESET;
  try {
    const raw = localStorage.getItem(RULESET_KEY);
    if (!raw) return DEFAULT_RULESET;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_RULESET;
  }
}

export function saveRuleset(ruleset: SecurityRuleset): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(RULESET_KEY, JSON.stringify(ruleset));
  }
}

export function calculateSummaryMetrics(scans: FileAnalysis[], findings: Finding[]): MetricSummary {
  const totalScans = scans.length;
  const filesAnalyzed = scans.length;
  const vulnerabilitiesFound = findings.length;
  const criticalFindings = findings.filter(f => f.severity === 'CRITICAL').length;
  const highFindings = findings.filter(f => f.severity === 'HIGH').length;
  const mediumFindings = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowFindings = findings.filter(f => f.severity === 'LOW').length;
  const cleanFiles = scans.filter(s => s.status === 'CLEAN').length;

  return {
    totalScans,
    filesAnalyzed,
    vulnerabilitiesFound,
    criticalFindings,
    highFindings,
    mediumFindings,
    lowFindings,
    cleanFiles
  };
}
