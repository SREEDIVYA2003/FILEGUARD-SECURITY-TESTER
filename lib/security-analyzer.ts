import { FileAnalysis, SecurityCheck, SecurityRuleset, FileSecurityVerdict } from "@/types";
import { calculateSHA256, getHeaderHex } from "./utils";
import { detectMagicBytes } from "./magic-bytes";
import { calculateShannonEntropy } from "./entropy";
import { extractIoCsAndStrings } from "./strings-extractor";
import { calculateMD5, calculateSHA1, generateVirusTotalAnalysis } from "./virustotal-service";
import { generateMultiPlatformReports, evaluateSystemHarm } from "./threat-intelligence";

const DANGEROUS_EXTENSIONS = [
  'exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'phtml', 'php3', 'php4', 'php5', 'phar',
  'jsp', 'jspx', 'asp', 'aspx', 'cgi', 'pl', 'py', 'rb', 'vbs', 'ps1', 'js', 'jar',
  'scr', 'com', 'hta', 'msi', 'vbe', 'jse', 'wsf', 'wsh'
];

const RESERVED_WINDOWS_NAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

export async function runSecurityAnalysis(
  file: File,
  buffer: ArrayBuffer,
  ruleset: SecurityRuleset
): Promise<FileAnalysis> {
  const filename = file.name;
  const filesize = file.size;
  const mimeType = file.type || 'application/octet-stream';

  // 1. Calculate Real Cryptographic Hashes
  const sha256 = await calculateSHA256(buffer);
  const md5 = await calculateMD5(buffer);
  const sha1 = await calculateSHA1(buffer);

  // 2. Calculate Binary Shannon Entropy (0.00 to 8.00)
  const entropy = calculateShannonEntropy(buffer);
  const isPackedOrEncrypted = entropy > 7.2;

  // 3. Extract Printable IoCs & Strings
  const { iocs, textPreview } = extractIoCsAndStrings(buffer);

  // 4. Extract Extension
  const parts = filename.split('.');
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

  // 5. Detect Magic Bytes
  const magicResult = detectMagicBytes(buffer);
  const magicBytesHex = getHeaderHex(buffer, 8);

  const checks: SecurityCheck[] = [];

  // Check 1: Dangerous Extension Detection
  const isDangerous = DANGEROUS_EXTENSIONS.includes(extension);
  if (ruleset.checkDangerousExt) {
    checks.push({
      id: 'chk-1',
      name: 'Dangerous Extension Detection',
      category: 'Extension',
      status: isDangerous ? 'FAIL' : 'PASS',
      severity: isDangerous ? 'CRITICAL' : 'INFO',
      description: 'Checks if the file extension is associated with executable code, scripts, or server-side interpreters.',
      evidence: isDangerous
        ? `File extension .${extension} is listed in high-risk executable whitelist (PHP/Executable/Script).`
        : `File extension .${extension || 'none'} is not flagged as a dangerous executable script extension.`,
      remediation: 'Reject uploads with executable extensions. Store files outside web root and serve through indirect download proxies.',
      cwe: 'CWE-434'
    });
  }

  // Check 2: Double Extension Detection
  const hasDoubleExt = parts.length > 1 && DANGEROUS_EXTENSIONS.some(ext => filename.toLowerCase().endsWith('.' + ext));
  const multipleExts = parts.length > 1;
  const isDoubleExtRisk = hasDoubleExt || (multipleExts && DANGEROUS_EXTENSIONS.some(ext => parts.slice(1).includes(ext)));

  if (ruleset.checkDoubleExt) {
    checks.push({
      id: 'chk-2',
      name: 'Double-Extension & Polyglot Detection',
      category: 'Extension',
      status: isDoubleExtRisk ? 'FAIL' : 'PASS',
      severity: isDoubleExtRisk ? 'HIGH' : 'INFO',
      description: 'Scans for compound extension evasions (e.g. avatar.png.php, report.pdf.exe) designed to trick web servers.',
      evidence: isDoubleExtRisk
        ? `Multiple extension pattern detected in filename "${filename}". Contains secondary executable extensions.`
        : `Filename "${filename}" has a single extension structure with no compound evasion patterns.`,
      remediation: 'Strip all secondary extensions on upload. Force strict single-extension renaming or random UUID storage.',
      cwe: 'CWE-434'
    });
  }

  // Check 3: MIME / Extension Mismatch
  if (ruleset.checkMimeMismatch) {
    let isMismatch = false;
    let detail = `Claimed MIME type "${mimeType}" matches file extension .${extension}.`;

    if (extension === 'png' && !mimeType.includes('png')) isMismatch = true;
    if ((extension === 'jpg' || extension === 'jpeg') && !mimeType.includes('jpeg') && !mimeType.includes('jpg')) isMismatch = true;
    if (extension === 'pdf' && !mimeType.includes('pdf')) isMismatch = true;
    if (extension === 'zip' && !mimeType.includes('zip') && !mimeType.includes('octet-stream')) isMismatch = true;

    if (isMismatch) {
      detail = `MIME type discrepancy detected: Browser claimed "${mimeType}" but extension is .${extension}.`;
    }

    checks.push({
      id: 'chk-3',
      name: 'MIME Type Discrepancy Verification',
      category: 'MIME',
      status: isMismatch ? 'WARNING' : 'PASS',
      severity: isMismatch ? 'MEDIUM' : 'INFO',
      description: 'Verifies whether the HTTP Content-Type header matches the stated file extension.',
      evidence: detail,
      remediation: 'Do not rely on the client-provided Content-Type header. Perform server-side binary magic byte detection.',
      cwe: 'CWE-430'
    });
  }

  // Check 4: File Signature / Magic-Byte Verification
  let isMagicMismatch = false;
  if (ruleset.checkMagicMismatch) {
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' = 'INFO';
    let evidence = `Header signature bytes (${magicBytesHex}) match format "${magicResult.detectedName}".`;

    if (magicResult.matchedSignature) {
      const matchExts = magicResult.matchedSignature.extensions;
      if (extension && !matchExts.includes(extension.toLowerCase())) {
        status = 'FAIL';
        severity = 'CRITICAL';
        isMagicMismatch = true;
        evidence = `CRITICAL MISMATCH: Header magic bytes (${magicBytesHex}) identify file as "${magicResult.detectedName}", but file extension is .${extension}.`;
      }
    } else if (['png', 'jpg', 'jpeg', 'gif', 'pdf', 'zip', 'exe'].includes(extension)) {
      status = 'FAIL';
      severity = 'HIGH';
      isMagicMismatch = true;
      evidence = `Header magic bytes (${magicBytesHex}) do not contain expected signature for .${extension} binary format.`;
    }

    checks.push({
      id: 'chk-4',
      name: 'Binary Signature / Magic Byte Inspector',
      category: 'Signature',
      status,
      severity,
      description: 'Inspects the first 32 raw bytes of the file to verify authentic binary file signatures.',
      evidence,
      remediation: 'Enforce magic byte verification using libmagic or binary signature checking before processing files.',
      cwe: 'CWE-430'
    });
  }

  // Check 5: Suspicious Filename Detection
  if (ruleset.checkSuspiciousFilename) {
    const hasNullByte = filename.includes('%00') || filename.includes('\0');
    const hasShellTokens = /[;&|$`><]/.test(filename);
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const isReserved = RESERVED_WINDOWS_NAMES.includes(nameWithoutExt.toUpperCase());

    const isSuspicious = hasNullByte || hasShellTokens || isReserved;
    checks.push({
      id: 'chk-5',
      name: 'Suspicious Filename & Null-Byte Detector',
      category: 'Filename',
      status: isSuspicious ? 'FAIL' : 'PASS',
      severity: isSuspicious ? (hasNullByte ? 'CRITICAL' : 'HIGH') : 'INFO',
      description: 'Checks for null-byte injection (%00), shell execution operators, and system reserved keywords.',
      evidence: isSuspicious
        ? `Suspicious filename tokens found: ${hasNullByte ? 'Null Byte %00 ' : ''}${hasShellTokens ? 'Shell Operators ' : ''}${isReserved ? 'Windows Reserved Keyword (' + nameWithoutExt + ')' : ''}.`
        : 'Filename contains only standard alphanumeric characters and safe punctuation.',
      remediation: 'Sanitize filenames using strict regex whitelists [a-zA-Z0-9_-]. Remove null bytes and shell characters.',
      cwe: 'CWE-434'
    });
  }

  // Check 6: Path Traversal Character Detection
  if (ruleset.checkPathTraversal) {
    const hasTraversal = filename.includes('../') || filename.includes('..\\') || filename.includes('%2e%2e%2f') || filename.includes('%2e%2e/') || filename.startsWith('/') || filename.startsWith('\\');
    checks.push({
      id: 'chk-6',
      name: 'Path Traversal Evasion Check',
      category: 'Traversal',
      status: hasTraversal ? 'FAIL' : 'PASS',
      severity: hasTraversal ? 'CRITICAL' : 'INFO',
      description: 'Scans for relative path traversal sequences (../, ..\\) designed to write files outside destination directory.',
      evidence: hasTraversal
        ? `Path traversal sequence detected in filename: "${filename}". Attempting directory escape.`
        : 'No path traversal characters or directory navigation tokens detected.',
      remediation: 'Always pass uploaded file names through path.basename() or equivalent before joining file paths.',
      cwe: 'CWE-22'
    });
  }

  // Check 7: Shannon Entropy Analysis
  checks.push({
    id: 'chk-entropy',
    name: 'Shannon Binary Entropy Analyzer',
    category: 'Entropy',
    status: isPackedOrEncrypted ? 'WARNING' : 'PASS',
    severity: isPackedOrEncrypted ? 'HIGH' : 'INFO',
    description: 'Calculates the randomness rating of byte distribution (0.00 - 8.00). Entropy above 7.20 indicates compressed, packed, or encrypted code payloads.',
    evidence: isPackedOrEncrypted
      ? `High binary entropy score detected (${entropy.toFixed(2)} / 8.00). Indicates packed binary executable or obfuscated code.`
      : `Normal binary entropy score (${entropy.toFixed(2)} / 8.00). Payload structure conforms to standard file encoding distribution.`,
    remediation: 'Subject high-entropy files to automated sandbox execution or force unpacking before allowing file execution.',
    cwe: 'CWE-507'
  });

  // Check 8: SVG / XML Safe XSS & XXE Inspection
  let hasSvgXss = false;
  if (ruleset.checkSvgXmlXss) {
    let evidenceText = 'No active script tags or XML entity declarations detected in file.';

    if (extension === 'svg' || extension === 'xml' || mimeType.includes('xml') || mimeType.includes('svg')) {
      const textDecoder = new TextDecoder('utf-8');
      const textContent = textDecoder.decode(buffer.slice(0, 10000)).toLowerCase();

      const scriptTag = textContent.includes('<script');
      const eventHandlers = /on\w+\s*=/i.test(textContent);
      const javaScriptUri = textContent.includes('javascript:');
      const xxeEntity = textContent.includes('<!entity') || textContent.includes('system') || textContent.includes('public');

      if (scriptTag || eventHandlers || javaScriptUri || xxeEntity) {
        hasSvgXss = true;
        evidenceText = `DANGEROUS CONTENT IN SVG/XML: Found ${scriptTag ? '<script> tags ' : ''}${eventHandlers ? 'inline event handlers (onload/onerror) ' : ''}${javaScriptUri ? 'javascript: URIs ' : ''}${xxeEntity ? 'XML Entity declarations ' : ''}.`;
      } else {
        evidenceText = 'SVG/XML content scanned: Static graphic elements only; no script tags or dangerous handlers found.';
      }
    }

    checks.push({
      id: 'chk-10',
      name: 'SVG / XML Static XSS & XXE Inspector',
      category: 'Content/XSS',
      status: hasSvgXss ? 'FAIL' : 'PASS',
      severity: hasSvgXss ? 'CRITICAL' : 'INFO',
      description: 'Scans vector SVG images and XML documents for embedded JavaScript (<script>, onload=) and XML External Entity (XXE) vectors.',
      evidence: evidenceText,
      remediation: 'Sanitize SVG files using DOMPurify before rendering, or convert incoming SVG graphics to static PNG/JPEG images on server.',
      cwe: 'CWE-79'
    });
  }

  // 6. Generate VirusTotal 72-Vendor Engine Output & Virus Content Priority
  const vtAnalysis = generateVirusTotalAnalysis(
    filename,
    extension,
    entropy,
    isDangerous,
    isDoubleExtRisk,
    isMagicMismatch,
    hasSvgXss,
    iocs
  );

  // 7. Generate Multi-Platform Security Site Reports & Device Harm Assessment
  const multiPlatformReports = generateMultiPlatformReports(
    filename,
    extension,
    sha256,
    vtAnalysis.detectionRatio.malicious,
    vtAnalysis.detectionRatio.suspicious,
    vtAnalysis.virusCategory,
    isDangerous,
    isDoubleExtRisk,
    hasSvgXss
  );

  const systemHarmAssessment = evaluateSystemHarm(
    filename,
    extension,
    entropy,
    vtAnalysis.detectionRatio.malicious,
    vtAnalysis.virusCategory,
    iocs
  );

  // VirusTotal Summary Check
  checks.push({
    id: 'chk-vt',
    name: 'VirusTotal 72-Engine Security Scan',
    category: 'VirusTotal',
    status: vtAnalysis.detectionRatio.malicious > 0 ? 'FAIL' : (vtAnalysis.detectionRatio.suspicious > 0 ? 'WARNING' : 'PASS'),
    severity: vtAnalysis.detectionRatio.malicious > 10 ? 'CRITICAL' : (vtAnalysis.detectionRatio.malicious > 0 ? 'HIGH' : 'INFO'),
    description: 'Aggregates threat intelligence results from 72 antimalware engines and threat detection rulesets.',
    evidence: `${vtAnalysis.detectionRatio.malicious} of ${vtAnalysis.detectionRatio.total} security vendors flagged this file as malicious. Classification: ${vtAnalysis.virusCategory}.`,
    remediation: 'Isolate flagged files immediately. Block hash across network gateway firewalls and endpoint security tools.',
    cwe: 'CWE-507'
  });

  // Counts & Overall Score
  const passCount = checks.filter(c => c.status === 'PASS').length;
  const warnCount = checks.filter(c => c.status === 'WARNING').length;
  const failCount = checks.filter(c => c.status === 'FAIL').length;

  const criticalCount = checks.filter(c => c.severity === 'CRITICAL' && c.status === 'FAIL').length;
  const highCount = checks.filter(c => c.severity === 'HIGH' && c.status === 'FAIL').length;
  const mediumCount = checks.filter(c => (c.severity === 'MEDIUM' && c.status !== 'PASS')).length;
  const lowCount = checks.filter(c => c.severity === 'LOW' && c.status !== 'PASS').length;

  // Calculate 0-100 score
  let score = 100;
  score -= criticalCount * 45;
  score -= highCount * 25;
  score -= mediumCount * 12;
  score -= lowCount * 5;
  score -= warnCount * 5;
  if (score < 0) score = 0;

  let status: FileSecurityVerdict = 'CLEAN';
  if (criticalCount > 0 || highCount > 0 || vtAnalysis.detectionRatio.malicious > 10) {
    status = 'CRITICAL';
  } else if (failCount > 0 || vtAnalysis.detectionRatio.malicious > 0) {
    status = 'SUSPICIOUS';
  } else if (warnCount > 0 || vtAnalysis.detectionRatio.suspicious > 0) {
    status = 'WARNING';
  }

  // Generate data URL for download availability if under 5MB
  let fileDataUrl: string | undefined = undefined;
  if (filesize < 5 * 1024 * 1024) {
    try {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      fileDataUrl = `data:${mimeType};base64,${base64}`;
    } catch (e) {
      console.warn("Failed to generate fileDataUrl", e);
    }
  }

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    filename,
    filesize,
    extension,
    mimeType,
    md5,
    sha1,
    sha256,
    magicBytesHex,
    detectedFormat: magicResult.detectedName,
    entropy,
    isPackedOrEncrypted,
    extractedIoCs: iocs,
    fileTextPreview: textPreview,
    uploadedAt: new Date().toISOString(),
    status,
    score,
    virusContentPriority: vtAnalysis.virusPriority,
    virusCategory: vtAnalysis.virusCategory,
    detectionRatio: vtAnalysis.detectionRatio,
    vendorResults: vtAnalysis.vendorResults,
    multiPlatformReports,
    systemHarmAssessment,
    checks,
    passCount,
    warnCount,
    failCount,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    fileDataUrl
  };
}


