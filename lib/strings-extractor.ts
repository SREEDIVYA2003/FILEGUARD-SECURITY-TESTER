import { ExtractedIoC } from "@/types";

/**
 * Extracts printable ASCII/UTF-8 strings and identifies Indicators of Compromise (IoCs).
 */
export function extractIoCsAndStrings(buffer: ArrayBuffer, maxChars = 20000): {
  iocs: ExtractedIoC[];
  textPreview: string;
} {
  const bytes = new Uint8Array(buffer.slice(0, maxChars));
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = decoder.decode(bytes);

  const iocs: ExtractedIoC[] = [];
  const seen = new Set<string>();

  // 1. IP Addresses (IPv4)
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const ipMatches = rawText.match(ipRegex) || [];
  for (const ip of ipMatches) {
    if (!seen.has(ip) && !ip.startsWith('0.0.0.0') && !ip.startsWith('127.0.0.1')) {
      seen.add(ip);
      iocs.push({
        type: 'IP',
        value: ip,
        risk: 'HIGH',
        context: `Embedded IPv4 Address reference detected in file payload.`
      });
    }
  }

  // 2. URLs / Endpoints
  const urlRegex = /https?:\/\/[^\s"'<>]{4,100}/gi;
  const urlMatches = rawText.match(urlRegex) || [];
  for (const url of urlMatches) {
    if (!seen.has(url)) {
      seen.add(url);
      iocs.push({
        type: 'URL',
        value: url,
        risk: url.includes('raw.githubusercontent') || url.includes('.xyz') || url.includes('.ru') ? 'HIGH' : 'MEDIUM',
        context: `Remote HTTP endpoint or C2 reference found in file.`
      });
    }
  }

  // 3. Shell / Execution Commands & Web Shell Tokens
  const suspiciousTokens = [
    { pattern: /\b(eval|passthru|shell_exec|exec|system|popen|proc_open)\s*\(/gi, name: 'PHP/Code Execution Primitive', risk: 'HIGH' as const },
    { pattern: /<\?php/gi, name: 'Embedded PHP Tag', risk: 'HIGH' as const },
    { pattern: /\b(cmd\.exe|powershell|\/bin\/sh|\/bin\/bash|wscript\.exe|cscript\.exe)\b/gi, name: 'System Command Shell Binary', risk: 'HIGH' as const },
    { pattern: /\b(VirtualAlloc|WriteProcessMemory|CreateRemoteThread|IsDebuggerPresent)\b/g, name: 'Win32 API Process Injection Primitive', risk: 'HIGH' as const },
    { pattern: /<script[\s>]/gi, name: 'Embedded JavaScript Script Tag', risk: 'HIGH' as const },
    { pattern: /\b(onload|onerror|onclick)\s*=/gi, name: 'Inline Event Handler Script Execution', risk: 'MEDIUM' as const },
    { pattern: /\b(base64_decode|gzinflate|str_rot13)\s*\(/gi, name: 'Script De-obfuscation Function', risk: 'HIGH' as const },
    { pattern: /EICAR-STANDARD-ANTIVIRUS-TEST-FILE/g, name: 'EICAR Standard Antivirus Benchmark Signature', risk: 'HIGH' as const }
  ];

  for (const item of suspiciousTokens) {
    const matches = rawText.match(item.pattern) || [];
    if (matches.length > 0 && matches[0]) {
      const matchVal = matches[0];
      if (!seen.has(matchVal)) {
        seen.add(matchVal);
        iocs.push({
          type: 'SUSPICIOUS_FUNC',
          value: item.name + `: "${matchVal}"`,
          risk: item.risk,
          context: `Found ${matches.length} occurrence(s) in payload.`
        });
      }
    }
  }

  // Generate text preview (cleaning unprintable characters)
  let textPreview = '';
  if (rawText) {
    textPreview = rawText
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (textPreview.length > 3000) {
      textPreview = textPreview.substring(0, 3000) + '\n... [TRUNCATED - Full file size extends beyond preview window]';
    }
  }

  return { iocs, textPreview };
}
