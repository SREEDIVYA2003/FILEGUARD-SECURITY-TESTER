import { FileAnalysis } from "@/types";
import { generateVirusTotalAnalysis } from "./virustotal-service";
import { generateMultiPlatformReports, evaluateSystemHarm } from "./threat-intelligence";

export function enrichScanWithReports(scan: FileAnalysis): FileAnalysis {
  if (!scan) return scan;

  const filename = scan.filename || 'unknown';
  const extension = scan.extension || '';
  const sha256 = scan.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const entropy = scan.entropy || 3.4;
  const iocs = scan.extractedIoCs || [];

  const isDangerousExt = ['exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'phtml', 'jsp', 'asp', 'aspx', 'py', 'vbs', 'ps1', 'js'].includes(extension.toLowerCase());
  const isDoubleExt = (scan.checks || []).some(c => c.name.includes('Double-Extension') && c.status === 'FAIL');
  const isMagicMismatch = (scan.checks || []).some(c => c.name.includes('Magic Byte') && c.status === 'FAIL');
  const hasSvgXss = (scan.checks || []).some(c => c.name.includes('SVG') && c.status === 'FAIL');

  // Always compute VT vendor results if missing or empty
  let vendorResults = scan.vendorResults;
  let detectionRatio = scan.detectionRatio;
  let virusPriority = scan.virusContentPriority;
  let virusCategory = scan.virusCategory;

  if (!vendorResults || vendorResults.length === 0) {
    const vtAnalysis = generateVirusTotalAnalysis(
      filename,
      extension,
      entropy,
      isDangerousExt,
      isDoubleExt,
      isMagicMismatch,
      hasSvgXss,
      iocs
    );
    vendorResults = vtAnalysis.vendorResults;
    detectionRatio = vtAnalysis.detectionRatio;
    virusPriority = vtAnalysis.virusPriority;
    virusCategory = vtAnalysis.virusCategory;
  }

  if (!detectionRatio) {
    detectionRatio = {
      malicious: (vendorResults || []).filter(v => v.category === 'malicious').length,
      suspicious: (vendorResults || []).filter(v => v.category === 'suspicious').length,
      clean: (vendorResults || []).filter(v => v.category === 'clean').length,
      total: (vendorResults || []).length || 72
    };
  }

  // Generate Multi-Platform Reports if missing or empty
  let multiPlatformReports = scan.multiPlatformReports;
  if (!multiPlatformReports || multiPlatformReports.length === 0) {
    multiPlatformReports = generateMultiPlatformReports(
      filename,
      extension,
      sha256,
      detectionRatio.malicious,
      detectionRatio.suspicious,
      virusCategory || 'Clean File',
      isDangerousExt,
      isDoubleExt,
      hasSvgXss
    );
  }

  // Generate System Harm Assessment if missing
  let systemHarmAssessment = scan.systemHarmAssessment;
  if (!systemHarmAssessment) {
    systemHarmAssessment = evaluateSystemHarm(
      filename,
      extension,
      entropy,
      detectionRatio.malicious,
      virusCategory || 'Clean File',
      iocs
    );
  }

  return {
    ...scan,
    detectionRatio,
    virusContentPriority: virusPriority || (detectionRatio.malicious > 10 ? 'P1-CRITICAL' : detectionRatio.malicious > 0 ? 'P2-HIGH' : 'P5-SAFE'),
    virusCategory: virusCategory || (detectionRatio.malicious > 0 ? 'Threat Detected' : 'Clean File Verified'),
    vendorResults,
    multiPlatformReports,
    systemHarmAssessment
  };
}
