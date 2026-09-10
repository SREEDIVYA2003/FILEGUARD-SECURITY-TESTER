export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type CheckStatus = 'PASS' | 'WARNING' | 'FAIL';

export type FileSecurityVerdict = 'CLEAN' | 'WARNING' | 'SUSPICIOUS' | 'CRITICAL';

export type VirusPriority = 'P1-CRITICAL' | 'P2-HIGH' | 'P3-MEDIUM' | 'P4-LOW' | 'P5-SAFE';

export type DeviceHarmLevel = 'CRITICAL_SYSTEM_DAMAGE' | 'HIGH_SYSTEM_RISK' | 'MODERATE_RISK' | 'LOW_RISK' | 'SAFE_NO_HARM';

export interface PlatformReport {
  platformName: string;
  platformIcon: string;
  verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'UNKNOWN';
  score: string; // e.g. "62/72" or "100/100"
  category: string;
  details: string;
  linkUrl?: string;
}

export interface SystemHarmAssessment {
  harmLevel: DeviceHarmLevel;
  overallHarmSummary: string;
  fileSystemDamage: { risk: boolean; description: string };
  registryPersistence: { risk: boolean; description: string };
  networkExfiltration: { risk: boolean; description: string };
  processInjection: { risk: boolean; description: string };
  deviceImpactTags: string[];
}

export interface VendorResult {
  engineName: string;
  category: 'malicious' | 'suspicious' | 'clean' | 'unsupported';
  result: string | null;
  engineVersion?: string;
  engineUpdate?: string;
}

export interface ExtractedIoC {
  type: 'IP' | 'URL' | 'SHELL_CMD' | 'SUSPICIOUS_FUNC' | 'FILE_PATH' | 'KEYWORD';
  value: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  context?: string;
}

export interface SecurityCheck {
  id: string;
  name: string;
  category: 'Extension' | 'MIME' | 'Signature' | 'Filename' | 'Traversal' | 'Unicode' | 'Size' | 'Archive' | 'Content/XSS' | 'Entropy' | 'VirusTotal';
  status: CheckStatus;
  severity: Severity;
  description: string;
  evidence: string;
  remediation: string;
  cwe?: string;
}

export interface FileAnalysis {
  id: string;
  filename: string;
  filesize: number;
  extension: string;
  mimeType: string;
  md5: string;
  sha1: string;
  sha256: string;
  magicBytesHex: string;
  detectedFormat: string;
  entropy: number; // 0.00 to 8.00
  isPackedOrEncrypted: boolean;
  extractedIoCs: ExtractedIoC[];
  fileTextPreview?: string;
  uploadedAt: string;
  status: FileSecurityVerdict;
  score: number; // 0 to 100
  virusContentPriority: VirusPriority;
  virusCategory: string; // e.g. "Trojan.Script.Webshell", "EICAR-Test-File", "Ransomware.Generic", "Clean Verified File"
  detectionRatio: {
    malicious: number;
    suspicious: number;
    clean: number;
    total: number;
  };
  vendorResults: VendorResult[];
  multiPlatformReports?: PlatformReport[];
  systemHarmAssessment?: SystemHarmAssessment;
  checks: SecurityCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  fileDataUrl?: string;
}

export interface Finding {
  id: string;
  scanId: string;
  filename: string;
  testName: string;
  category: string;
  severity: Severity;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'MUTED';
  cwe: string;
  description: string;
  evidence: string;
  remediation: string;
  timestamp: string;
}

export interface SecurityRuleset {
  maxFileSizeMB: number;
  allowedExtensions: string[];
  checkDangerousExt: boolean;
  checkDoubleExt: boolean;
  checkMimeMismatch: boolean;
  checkMagicMismatch: boolean;
  checkSuspiciousFilename: boolean;
  checkPathTraversal: boolean;
  checkUnicodeAnomalies: boolean;
  checkOversizedFile: boolean;
  checkArchiveSecurity: boolean;
  checkSvgXmlXss: boolean;
  strictMode: boolean;
  virusTotalApiKey?: string;
  theme: 'cyber-dark' | 'obsidian' | 'matrix' | 'slate';
}

export interface MetricSummary {
  totalScans: number;
  filesAnalyzed: number;
  vulnerabilitiesFound: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  cleanFiles: number;
}


