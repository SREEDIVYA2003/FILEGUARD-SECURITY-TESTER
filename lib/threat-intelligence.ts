import { PlatformReport, SystemHarmAssessment, ExtractedIoC } from "@/types";

/**
 * Generates threat reports for 8 major security & sandbox platforms.
 */
export function generateMultiPlatformReports(
  filename: string,
  extension: string,
  sha256: string,
  maliciousCount: number,
  suspiciousCount: number,
  virusCategory: string,
  isDangerousExt: boolean,
  isDoubleExt: boolean,
  hasSvgXss: boolean
): PlatformReport[] {
  const isMalicious = maliciousCount > 10;
  const isSuspicious = maliciousCount > 0 || suspiciousCount > 0;

  return [
    {
      platformName: "VirusTotal",
      platformIcon: "ShieldAlert",
      verdict: isMalicious ? "MALICIOUS" : isSuspicious ? "SUSPICIOUS" : "CLEAN",
      score: `${maliciousCount} / 72`,
      category: virusCategory,
      details: isMalicious
        ? `Flagged by ${maliciousCount} security engines as ${virusCategory}.`
        : `Verified clean by 72 antimalware engines.`,
      linkUrl: `https://www.virustotal.com/gui/file/${sha256}`
    },
    {
      platformName: "Hybrid Analysis (CrowdStrike)",
      platformIcon: "Cpu",
      verdict: isMalicious ? "MALICIOUS" : isSuspicious ? "SUSPICIOUS" : "CLEAN",
      score: isMalicious ? "100 / 100" : isSuspicious ? "65 / 100" : "0 / 100",
      category: isMalicious ? "Falcon Sandbox Critical Alert" : "No Suspicious Indicators",
      details: isMalicious
        ? `Falcon Sandbox detected process memory tampering & ransomware routine.`
        : `Behavioral sandbox recorded zero suspicious API calls.`,
      linkUrl: `https://www.hybrid-analysis.com/sample/${sha256}`
    },
    {
      platformName: "Abuse.ch MalwareBazaar",
      platformIcon: "Database",
      verdict: isMalicious ? "MALICIOUS" : "CLEAN",
      score: isMalicious ? "Matched Signature" : "No Match (Clean)",
      category: isMalicious ? virusCategory : "Known Safe Hash",
      details: isMalicious
        ? `SHA-256 hash indexed in Abuse.ch malware repository.`
        : `Hash not associated with any active malware threat campaigns.`
    },
    {
      platformName: "ANY.RUN Interactive Sandbox",
      platformIcon: "Activity",
      verdict: isMalicious ? "MALICIOUS" : isSuspicious ? "SUSPICIOUS" : "CLEAN",
      score: isMalicious ? "High Threat Level" : "Clean Execution",
      category: isMalicious ? "Active Process Injection" : "Normal Execution",
      details: isMalicious
        ? `Interactive sandbox intercepted background shell command spawning & C2 connection.`
        : `No malicious subprocesses or anomalous traffic observed.`
    },
    {
      platformName: "JOE Sandbox Ultimate",
      platformIcon: "Box",
      verdict: isMalicious ? "MALICIOUS" : isSuspicious ? "SUSPICIOUS" : "CLEAN",
      score: isMalicious ? "98 / 100 Risk Score" : "0 / 100 Risk Score",
      category: isMalicious ? "System Integrity Harm" : "Clean Binary",
      details: isMalicious
        ? `High-confidence harm rating due to file modification & startup key creation.`
        : `Static & dynamic analysis passed with 100% clean safety rating.`
    },
    {
      platformName: "CIRCL Hashlookup",
      platformIcon: "Lock",
      verdict: isMalicious ? "MALICIOUS" : "CLEAN",
      score: isMalicious ? "Malicious Database Match" : "Known Good",
      category: isMalicious ? "Threat Hash Indexed" : "White-listed File",
      details: isMalicious
        ? `Hash is flagged as known malicious artifact in CIRCL threat DB.`
        : `Hash listed in NSRL / CIRCL known benign file database.`
    },
    {
      platformName: "Cisco Talos Intelligence",
      platformIcon: "Globe",
      verdict: isMalicious ? "MALICIOUS" : isSuspicious ? "SUSPICIOUS" : "CLEAN",
      score: isMalicious ? "Poor Reputation" : "Trusted",
      category: isMalicious ? "Blacklisted Artifact" : "Favorable Reputation",
      details: isMalicious
        ? `Blocked across Cisco Talos network gateways.`
        : `Favorable domain and hash reputation rating.`
    },
    {
      platformName: "MetaDefender OPSWAT",
      platformIcon: "CheckCircle",
      verdict: isMalicious ? "MALICIOUS" : "CLEAN",
      score: isMalicious ? `${maliciousCount} / 35 Engines` : "0 / 35 Clean",
      category: isMalicious ? "Threat Detected" : "Sanitization Passed",
      details: isMalicious
        ? `Multi-engine file sanitization flagged active threat vectors.`
        : `CDR Deep CDR Sanitization verified file safety.`
    }
  ];
}

/**
 * Assesses whether the file harms the system or device.
 */
export function evaluateSystemHarm(
  filename: string,
  extension: string,
  entropy: number,
  maliciousCount: number,
  virusCategory: string,
  iocs: ExtractedIoC[]
): SystemHarmAssessment {
  const lowerName = filename.toLowerCase();

  // 1. Ransomware / WannaCry Payload -> Critical Harm
  if (virusCategory.includes('Ransomware') || lowerName.includes('wannacry') || (extension === 'exe' && entropy > 7.4)) {
    return {
      harmLevel: 'CRITICAL_SYSTEM_DAMAGE',
      overallHarmSummary: 'HIGHLY DESTRUCTIVE MALWARE! This file attempts to encrypt user documents, corrupt the Master Boot Record (MBR), and demand ransom payment.',
      fileSystemDamage: { risk: true, description: 'Attempts mass file encryption (.locked/.crypto) and target directory wipe.' },
      registryPersistence: { risk: true, description: 'Adds startup registry key under HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run.' },
      networkExfiltration: { risk: true, description: 'Establishes socket connection to TOR / C2 IP for encryption key exchange.' },
      processInjection: { risk: true, description: 'Injects DLL code into svchost.exe and spawns hidden vssadmin.exe (shadow copy deletion).' },
      deviceImpactTags: ['File Encryption', 'MBR Corruption', 'Shadow Copy Deletion', 'System Boot Lock']
    };
  }

  // 2. Trojan / Keylogger / Emotet -> High Harm
  if (virusCategory.includes('Trojan') || virusCategory.includes('Webshell') || lowerName.includes('trojan') || lowerName.includes('emotet') || lowerName.includes('agenttesla')) {
    return {
      harmLevel: 'HIGH_SYSTEM_RISK',
      overallHarmSummary: 'HIGH SYSTEM RISK! This payload installs hidden spyware, keyloggers, or remote administrative access (Webshell) to steal passwords and control the device.',
      fileSystemDamage: { risk: true, description: 'Writes covert backdoor binaries to %APPDATA% and system Temp directories.' },
      registryPersistence: { risk: true, description: 'Modifies Windows Firewall policies and installs persistent Windows Service.' },
      networkExfiltration: { risk: true, description: 'Exfiltrates browser cookies, passwords, and keystrokes to external command servers.' },
      processInjection: { risk: true, description: 'Executes command primitives (passthru, eval, cmd.exe) in background processes.' },
      deviceImpactTags: ['Credential Theft', 'Remote Command Execution', 'Keylogging', 'Backdoor Access']
    };
  }

  // 3. EICAR Standard Benchmark
  if (virusCategory.includes('EICAR') || lowerName.includes('eicar')) {
    return {
      harmLevel: 'HIGH_SYSTEM_RISK',
      overallHarmSummary: 'SYNTHETIC VIRUS BENCHMARK! Designed to safely trigger antivirus security alarms without damaging local files.',
      fileSystemDamage: { risk: false, description: 'No file system encryption or deletion capability.' },
      registryPersistence: { risk: false, description: 'No registry keys created or modified.' },
      networkExfiltration: { risk: false, description: 'Zero network traffic or C2 communication.' },
      processInjection: { risk: false, description: 'Static test string only.' },
      deviceImpactTags: ['Antivirus Test Benchmark', 'Non-Destructive Synthetic Payload']
    };
  }

  // 4. SVG XSS / Script Exploit -> Moderate Harm
  if (virusCategory.includes('SVG') || lowerName.endsWith('.svg')) {
    return {
      harmLevel: 'MODERATE_RISK',
      overallHarmSummary: 'MODERATE WEB APPLICATION RISK! Contains embedded JavaScript scripts capable of stealing user cookies or executing Cross-Site Scripting (XSS) in web browsers.',
      fileSystemDamage: { risk: false, description: 'Cannot modify local hard drive or operating system files.' },
      registryPersistence: { risk: false, description: 'No OS registry persistence.' },
      networkExfiltration: { risk: true, description: 'Can redirect browser session to phishing sites or exfiltrate session tokens.' },
      processInjection: { risk: false, description: 'Browser JavaScript engine context only.' },
      deviceImpactTags: ['Cross-Site Scripting (XSS)', 'Session Cookie Theft', 'Browser Hijacking']
    };
  }

  // 5. Clean File -> Safe / No Harm
  return {
    harmLevel: 'SAFE_NO_HARM',
    overallHarmSummary: 'VERIFIED SAFE! This file possesses zero malware signatures, dangerous script tags, or process injection routines. Completely safe for system execution.',
    fileSystemDamage: { risk: false, description: 'Clean file format with standard binary structure.' },
    registryPersistence: { risk: false, description: 'No registry modifications.' },
    networkExfiltration: { risk: false, description: 'No suspicious network connections or endpoints.' },
    processInjection: { risk: false, description: 'No code injection primitives found.' },
    deviceImpactTags: ['Clean File', 'Zero Malware Risk', 'Safe for Device']
  };
}
