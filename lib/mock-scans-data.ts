import { FileAnalysis, Finding, SecurityRuleset } from "@/types";
import { SECURITY_ENGINES } from "./virustotal-service";
import { generateMultiPlatformReports, evaluateSystemHarm } from "./threat-intelligence";

export const DEFAULT_RULESET: SecurityRuleset = {
  maxFileSizeMB: 10,
  allowedExtensions: ['png', 'jpg', 'jpeg', 'pdf', 'docx', 'xlsx', 'txt', 'csv', 'svg'],
  checkDangerousExt: true,
  checkDoubleExt: true,
  checkMimeMismatch: true,
  checkMagicMismatch: true,
  checkSuspiciousFilename: true,
  checkPathTraversal: true,
  checkUnicodeAnomalies: true,
  checkOversizedFile: true,
  checkArchiveSecurity: true,
  checkSvgXmlXss: true,
  strictMode: true,
  theme: 'cyber-dark'
};

const generateMockVendorResults = (maliciousCount: number, suspiciousCount: number, threatLabel: string) => {
  return SECURITY_ENGINES.map((engine, idx) => {
    let category: 'malicious' | 'suspicious' | 'clean' = 'clean';
    let result: string | null = 'Clean / Undetected';

    if (idx < maliciousCount) {
      category = 'malicious';
      result = `${engine}.${threatLabel}.Gen`;
    } else if (idx < maliciousCount + suspiciousCount) {
      category = 'suspicious';
      result = `Heur.Riskware.${engine.substring(0, 3)}`;
    }

    return {
      engineName: engine,
      category,
      result,
      engineVersion: `v14.${idx % 9}`,
      engineUpdate: new Date().toISOString().split('T')[0]
    };
  });
};

export const INITIAL_MOCK_SCANS: FileAnalysis[] = [
  {
    id: 'scan-demo-101',
    filename: 'user_profile_avatar.png.php',
    filesize: 142050,
    extension: 'php',
    mimeType: 'image/png',
    md5: '7b8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f',
    sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    magicBytesHex: '89 50 4E 47 0D 0A 1A 0A',
    detectedFormat: 'Portable Network Graphics (PNG)',
    entropy: 7.64,
    isPackedOrEncrypted: true,
    fileTextPreview: `PNG Header Signature: 89 50 4E 47\n<?php\n// Demonstration Payload\n$cmd = $_GET['cmd'];\n?>`,
    extractedIoCs: [
      { type: 'SUSPICIOUS_FUNC', value: 'PHP Execution Primitive', risk: 'HIGH', context: 'Found in PHP polyglot avatar payload.' },
      { type: 'SUSPICIOUS_FUNC', value: 'PHP De-obfuscation Function', risk: 'HIGH', context: 'Dynamic evaluation call.' }
    ],
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'CRITICAL',
    score: 15,
    virusContentPriority: 'P1-CRITICAL',
    virusCategory: 'Trojan.Script.Webshell.PHP',
    detectionRatio: { malicious: 58, suspicious: 6, clean: 8, total: 72 },
    vendorResults: generateMockVendorResults(58, 6, 'Webshell.PHP'),
    multiPlatformReports: generateMultiPlatformReports(
      'user_profile_avatar.png.php', 'php', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      58, 6, 'Trojan.Script.Webshell.PHP', true, true, false
    ),
    systemHarmAssessment: evaluateSystemHarm(
      'user_profile_avatar.png.php', 'php', 7.64, 58, 'Trojan.Script.Webshell.PHP',
      [{ type: 'SUSPICIOUS_FUNC', value: 'PHP Execution Primitive', risk: 'HIGH' }]
    ),
    passCount: 5,
    warnCount: 1,
    failCount: 4,
    criticalCount: 2,
    highCount: 1,
    mediumCount: 1,
    lowCount: 0,
    checks: [
      {
        id: 'chk-demo-1',
        name: 'Dangerous Extension Detection',
        category: 'Extension',
        status: 'FAIL',
        severity: 'CRITICAL',
        description: 'Checks if file extension is executable code or server-side interpreter.',
        evidence: 'File extension .php is listed in high-risk executable script whitelist.',
        remediation: 'Reject uploads with executable extensions. Store files outside web root.',
        cwe: 'CWE-434'
      },
      {
        id: 'chk-demo-2',
        name: 'Double-Extension & Polyglot Detection',
        category: 'Extension',
        status: 'FAIL',
        severity: 'HIGH',
        description: 'Scans for compound extension evasions.',
        evidence: 'Compound extension pattern detected: user_profile_avatar.png.php.',
        remediation: 'Force strict single-extension renaming or random UUID storage.',
        cwe: 'CWE-434'
      },
      {
        id: 'chk-demo-3',
        name: 'Binary Signature / Magic Byte Inspector',
        category: 'Signature',
        status: 'FAIL',
        severity: 'CRITICAL',
        description: 'Inspects header signature bytes.',
        evidence: 'CRITICAL MISMATCH: Magic bytes (89 50 4E 47) identify file as PNG, but extension is .php.',
        remediation: 'Enforce magic byte verification using libmagic before saving files.',
        cwe: 'CWE-430'
      },
      {
        id: 'chk-demo-4',
        name: 'MIME Type Discrepancy Verification',
        category: 'MIME',
        status: 'WARNING',
        severity: 'MEDIUM',
        description: 'Verifies Content-Type header matches extension.',
        evidence: 'MIME claimed "image/png" but file extension is .php.',
        remediation: 'Perform server-side binary magic byte detection.',
        cwe: 'CWE-430'
      }
    ]
  },
  {
    id: 'scan-demo-102',
    filename: 'Q3_Financial_Statement.pdf',
    filesize: 2450890,
    extension: 'pdf',
    mimeType: 'application/pdf',
    md5: 'a1f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    sha1: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    sha256: 'a1f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    magicBytesHex: '25 50 44 46 2D 31 2E 37',
    detectedFormat: 'PDF Document',
    entropy: 3.42,
    isPackedOrEncrypted: false,
    fileTextPreview: `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj`,
    extractedIoCs: [],
    uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'CLEAN',
    score: 100,
    virusContentPriority: 'P5-SAFE',
    virusCategory: 'Clean Verified Document',
    detectionRatio: { malicious: 0, suspicious: 0, clean: 72, total: 72 },
    vendorResults: generateMockVendorResults(0, 0, 'Clean'),
    multiPlatformReports: generateMultiPlatformReports(
      'Q3_Financial_Statement.pdf', 'pdf', 'a1f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      0, 0, 'Clean Verified Document', false, false, false
    ),
    systemHarmAssessment: evaluateSystemHarm(
      'Q3_Financial_Statement.pdf', 'pdf', 3.42, 0, 'Clean Verified Document', []
    ),
    passCount: 10,
    warnCount: 0,
    failCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    checks: [
      {
        id: 'chk-demo-201',
        name: 'Dangerous Extension Detection',
        category: 'Extension',
        status: 'PASS',
        severity: 'INFO',
        description: 'Extension .pdf is not flagged as executable.',
        evidence: 'Extension .pdf is safe.',
        remediation: 'None required.',
        cwe: 'CWE-434'
      },
      {
        id: 'chk-demo-202',
        name: 'Binary Signature / Magic Byte Inspector',
        category: 'Signature',
        status: 'PASS',
        severity: 'INFO',
        description: 'Header signature bytes match PDF document.',
        evidence: 'Header signature 25 50 44 46 (%PDF) matches extension .pdf.',
        remediation: 'None required.'
      }
    ]
  },
  {
    id: 'scan-demo-103',
    filename: 'company_banner_icon.svg',
    filesize: 45200,
    extension: 'svg',
    mimeType: 'image/svg+xml',
    md5: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c',
    sha1: '7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b',
    sha256: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
    magicBytesHex: '3C 3F 78 6D 6C 20 76 65',
    detectedFormat: 'XML / SVG Vector Image',
    entropy: 4.82,
    isPackedOrEncrypted: false,
    fileTextPreview: `<svg xmlns="http://www.w3.org/2000/svg">
  <!-- Vector Graphic with Script Payload -->
</svg>`,
    extractedIoCs: [
      { type: 'SUSPICIOUS_FUNC', value: 'Embedded Script Tag', risk: 'HIGH', context: 'Vector SVG contains active script payload.' }
    ],
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'CRITICAL',
    score: 35,
    virusContentPriority: 'P3-MEDIUM',
    virusCategory: 'Exploit.CVE-2023.SVG-XSS-Vector',
    detectionRatio: { malicious: 24, suspicious: 18, clean: 30, total: 72 },
    vendorResults: generateMockVendorResults(24, 18, 'SVG.XSS'),
    multiPlatformReports: generateMultiPlatformReports(
      'company_banner_icon.svg', 'svg', '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
      24, 18, 'Exploit.CVE-2023.SVG-XSS-Vector', false, false, true
    ),
    systemHarmAssessment: evaluateSystemHarm(
      'company_banner_icon.svg', 'svg', 4.82, 24, 'Exploit.CVE-2023.SVG-XSS-Vector',
      [{ type: 'SUSPICIOUS_FUNC', value: 'Embedded Script Tag', risk: 'HIGH' }]
    ),
    passCount: 7,
    warnCount: 1,
    failCount: 2,
    criticalCount: 1,
    highCount: 1,
    mediumCount: 0,
    lowCount: 0,
    checks: [
      {
        id: 'chk-demo-301',
        name: 'SVG / XML Static XSS & XXE Inspector',
        category: 'Content/XSS',
        status: 'FAIL',
        severity: 'CRITICAL',
        description: 'Scans vector SVG images for embedded JavaScript execution vectors.',
        evidence: 'DANGEROUS CONTENT IN SVG: Found script tags and inline event handlers.',
        remediation: 'Sanitize SVG files using DOMPurify before serving or convert SVG to PNG.',
        cwe: 'CWE-79'
      }
    ]
  }
];

export const INITIAL_MOCK_FINDINGS: Finding[] = [
  {
    id: 'find-101',
    scanId: 'scan-demo-101',
    filename: 'user_profile_avatar.png.php',
    testName: 'Dangerous Extension Detection',
    category: 'Extension',
    severity: 'CRITICAL',
    status: 'OPEN',
    cwe: 'CWE-434',
    description: 'File extension .php is listed in high-risk executable whitelist.',
    evidence: 'Filename ends with .php extension with PNG magic bytes.',
    remediation: 'Reject uploads with executable extensions. Store files outside web root.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'find-102',
    scanId: 'scan-demo-101',
    filename: 'user_profile_avatar.png.php',
    testName: 'Binary Signature / Magic Byte Inspector',
    category: 'Signature',
    severity: 'CRITICAL',
    status: 'OPEN',
    cwe: 'CWE-430',
    description: 'Magic bytes (89 50 4E 47) identify file as PNG, but extension is .php.',
    evidence: 'Header hex: 89 50 4E 47 0D 0A 1A 0A.',
    remediation: 'Enforce magic byte verification using libmagic before saving files.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'find-103',
    scanId: 'scan-demo-103',
    filename: 'company_banner_icon.svg',
    testName: 'SVG / XML Static XSS & XXE Inspector',
    category: 'Content/XSS',
    severity: 'CRITICAL',
    status: 'IN_REVIEW',
    cwe: 'CWE-79',
    description: 'Found script tags and inline event handlers in SVG file.',
    evidence: 'Script tag in vector graphic.',
    remediation: 'Sanitize SVG files using DOMPurify before serving or convert SVG to PNG.',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];
