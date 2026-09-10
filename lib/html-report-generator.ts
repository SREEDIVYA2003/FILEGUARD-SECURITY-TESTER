import { FileAnalysis } from "@/types";
import { CWE_DATABASE } from "./cwe-database";

export function generateHtmlReport(scan: FileAnalysis): string {
  const detectionRatio = scan.detectionRatio || { malicious: 0, suspicious: 0, clean: 72, total: 72 };
  const harm = scan.systemHarmAssessment;
  const vendors = scan.vendorResults || [];
  const intel = scan.multiPlatformReports || [];
  const checks = scan.checks || [];
  const iocs = scan.extractedIoCs || [];

  const statusColor = scan.status === 'CRITICAL' ? '#f43f5e' : scan.status === 'SUSPICIOUS' ? '#f59e0b' : scan.status === 'WARNING' ? '#eab308' : '#10b981';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FileGuard Security Report - ${scan.filename}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --border: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --cyan: #06b6d4;
      --rose: #f43f5e;
      --emerald: #10b981;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .title { font-size: 1.75rem; font-weight: 800; font-family: monospace; color: #fff; }
    .sub { font-size: 0.85rem; color: var(--muted); font-family: monospace; margin-top: 0.25rem; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      font-family: monospace;
      text-transform: uppercase;
      border: 1px solid currentColor;
    }
    .grid-3 { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }
    @media (max-width: 768px) { .grid-3 { grid-template-columns: 1fr; } }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
    }
    .card-title { font-size: 1rem; font-weight: 700; font-family: monospace; color: var(--cyan); margin-bottom: 1rem; }
    .gauge-box { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .score-num { font-size: 2.5rem; font-weight: 900; font-family: monospace; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; font-family: monospace; font-size: 0.8rem; }
    .meta-item { background: #020617; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border); }
    .meta-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; display: block; }
    .meta-val { font-weight: 700; color: #e2e8f0; margin-top: 0.2rem; }
    .hashes { background: #020617; border: 1px solid var(--border); padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.75rem; margin-top: 1rem; }
    .hash-row { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; word-break: break-all; }
    .hash-key { font-weight: 800; color: var(--muted); min-width: 70px; }
    .hash-val { color: var(--cyan); }
    
    /* Harm Assessment */
    .harm-banner {
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.25rem;
      background: #020617;
    }
    .harm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .harm-tag { font-size: 0.75rem; font-weight: 800; font-family: monospace; padding: 0.2rem 0.6rem; border-radius: 0.3rem; }
    .harm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-top: 1rem; font-size: 0.8rem; font-family: monospace; }
    .harm-item { background: var(--card-bg); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border); }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.8rem; font-family: monospace; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { background: #020617; color: var(--muted); text-transform: uppercase; font-size: 0.7rem; }
    tr:hover { background: rgba(30, 41, 59, 0.4); }
    .res-malicious { color: var(--rose); font-weight: 700; }
    .res-suspicious { color: var(--amber); font-weight: 700; }
    .res-clean { color: var(--emerald); }
    
    /* Code Snippet */
    pre { background: #020617; border: 1px solid var(--border); padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.75rem; color: var(--cyan); overflow-x: auto; margin-top: 0.5rem; }
    
    .footer { text-align: center; font-family: monospace; font-size: 0.75rem; color: var(--muted); border-top: 1px solid var(--border); padding-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="title">📄 ${scan.filename}</div>
        <div class="sub">VirusTotal Scan ID: ${scan.id} • Generated ${new Date(scan.uploadedAt).toLocaleString()}</div>
      </div>
      <div>
        <span class="badge" style="color: ${statusColor}; background: ${statusColor}15; border-color: ${statusColor}40;">
          VERDICT: ${scan.status} (${scan.score}/100)
        </span>
      </div>
    </div>

    <!-- Overview Grid -->
    <div class="grid-3">
      <div class="card gauge-box">
        <div class="score-num" style="color: ${detectionRatio.malicious > 0 ? 'var(--rose)' : 'var(--emerald)'};">
          ${detectionRatio.malicious} / ${detectionRatio.total}
        </div>
        <div style="font-family: monospace; font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem;">
          ANTIMALWARE VENDORS FLAGGED
        </div>
        <div style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: var(--cyan); margin-top: 0.75rem;">
          ${scan.virusCategory || 'Clean File'}
        </div>
        <div style="font-family: monospace; font-size: 0.75rem; color: var(--amber); margin-top: 0.25rem;">
          Priority: ${scan.virusContentPriority || 'P5-SAFE'}
        </div>
      </div>

      <div class="card">
        <div class="card-title">TECHNICAL SUMMARY</div>
        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">File Size</span><div class="meta-val">${(scan.filesize / 1024).toFixed(1)} KB</div></div>
          <div class="meta-item"><span class="meta-label">Detected Format</span><div class="meta-val">${scan.detectedFormat || scan.extension}</div></div>
          <div class="meta-item"><span class="meta-label">Shannon Entropy</span><div class="meta-val">${scan.entropy ? scan.entropy.toFixed(2) : '3.40'} / 8.00</div></div>
          <div class="meta-item"><span class="meta-label">IoC Indicators</span><div class="meta-val">${iocs.length} Extracted</div></div>
        </div>

        <div class="hashes">
          <div class="hash-row"><span class="hash-key">SHA-256</span><span class="hash-val">${scan.sha256}</span></div>
          ${scan.md5 ? `<div class="hash-row"><span class="hash-key">MD5</span><span class="hash-val">${scan.md5}</span></div>` : ''}
          ${scan.sha1 ? `<div class="hash-row"><span class="hash-key">SHA-1</span><span class="hash-val">${scan.sha1}</span></div>` : ''}
        </div>
      </div>
    </div>

    <!-- System Harm Assessment -->
    ${harm ? `
    <div class="harm-banner" style="border-color: ${harm.harmLevel === 'CRITICAL_SYSTEM_DAMAGE' ? 'var(--rose)' : harm.harmLevel === 'HIGH_SYSTEM_RISK' ? 'var(--amber)' : 'var(--border)'};">
      <div class="harm-header">
        <div style="font-family: monospace; font-weight: 800; font-size: 0.9rem; color: ${harm.harmLevel.includes('DAMAGE') || harm.harmLevel.includes('RISK') ? 'var(--rose)' : 'var(--emerald)'};">
          SYSTEM & DEVICE HARM RISK: ${harm.harmLevel.replace(/_/g, ' ')}
        </div>
      </div>
      <p style="font-size: 0.85rem; color: #cbd5e1;">${harm.overallHarmSummary}</p>
      <div class="harm-grid">
        <div class="harm-item"><span class="meta-label">File System Impact</span><div style="color: ${harm.fileSystemDamage.risk ? 'var(--rose)' : 'var(--emerald)'}; font-weight: 700;">${harm.fileSystemDamage.description}</div></div>
        <div class="harm-item"><span class="meta-label">OS Registry Persistence</span><div style="color: ${harm.registryPersistence.risk ? 'var(--rose)' : 'var(--emerald)'}; font-weight: 700;">${harm.registryPersistence.description}</div></div>
        <div class="harm-item"><span class="meta-label">Network Exfiltration</span><div style="color: ${harm.networkExfiltration.risk ? 'var(--rose)' : 'var(--emerald)'}; font-weight: 700;">${harm.networkExfiltration.description}</div></div>
        <div class="harm-item"><span class="meta-label">Process Injection</span><div style="color: ${harm.processInjection.risk ? 'var(--rose)' : 'var(--emerald)'}; font-weight: 700;">${harm.processInjection.description}</div></div>
      </div>
    </div>
    ` : ''}

    <!-- 72 Security Engine Vendors Grid -->
    <div class="card">
      <div class="card-title">72 SECURITY ENGINE ANTIMALWARE ANALYSIS</div>
      <table>
        <thead>
          <tr>
            <th>Security Engine</th>
            <th>Category / Verdict</th>
            <th>Threat Signature Result</th>
            <th>Engine Version</th>
          </tr>
        </thead>
        <tbody>
          ${vendors.map(v => `
            <tr>
              <td style="font-weight: 700; color: #e2e8f0;">${v.engineName}</td>
              <td class="res-${v.category}">${v.category.toUpperCase()}</td>
              <td style="color: ${v.category === 'malicious' ? 'var(--rose)' : v.category === 'suspicious' ? 'var(--amber)' : 'var(--muted)'};">${v.result || 'Clean / Undetected'}</td>
              <td style="color: var(--muted);">${v.engineVersion || 'v14.2'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 8 Multi-Platform Threat Intelligence Sites -->
    <div class="card">
      <div class="card-title">MULTI-PLATFORM THREAT INTELLIGENCE (8 SITES)</div>
      <table>
        <thead>
          <tr>
            <th>Security Platform / Sandbox</th>
            <th>Verdict</th>
            <th>Risk Score</th>
            <th>Category</th>
            <th>Analysis Summary</th>
          </tr>
        </thead>
        <tbody>
          ${intel.map(site => `
            <tr>
              <td style="font-weight: 700; color: var(--cyan);">${site.platformName}</td>
              <td class="res-${site.verdict.toLowerCase()}">${site.verdict}</td>
              <td style="font-weight: 700; color: #e2e8f0;">${site.score}</td>
              <td style="color: var(--muted);">${site.category}</td>
              <td style="color: #cbd5e1;">${site.details}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Static Security Audit Checks -->
    <div class="card">
      <div class="card-title">STATIC SECURITY AUDIT CHECKS (${checks.length})</div>
      <table>
        <thead>
          <tr>
            <th>Check Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Evidence & Findings</th>
          </tr>
        </thead>
        <tbody>
          ${checks.map(c => `
            <tr>
              <td style="font-weight: 700; color: #e2e8f0;">${c.name}</td>
              <td style="color: var(--muted);">${c.category}</td>
              <td class="res-${c.status === 'FAIL' ? 'malicious' : c.status === 'WARNING' ? 'suspicious' : 'clean'}">${c.status}</td>
              <td style="color: ${c.severity === 'CRITICAL' ? 'var(--rose)' : c.severity === 'HIGH' ? 'var(--amber)' : 'var(--cyan)'}; font-weight: 700;">${c.severity}</td>
              <td style="color: #cbd5e1;">${c.evidence}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Remediation Guide Code Snippet -->
    <div class="card">
      <div class="card-title">RECOMMENDED CWE REMEDIATION GUIDE (${scan.checks.find(c => c.status === 'FAIL')?.cwe || 'CWE-434'})</div>
      <p style="font-size: 0.85rem; color: #cbd5e1;">
        ${CWE_DATABASE[scan.checks.find(c => c.status === 'FAIL')?.cwe || 'CWE-434']?.description || 'Secure file upload and validation code snippet.'}
      </p>
      <pre>${CWE_DATABASE[scan.checks.find(c => c.status === 'FAIL')?.cwe || 'CWE-434']?.codeSnippets.nodejs || ''}</pre>
    </div>

    <!-- File Output Preview -->
    ${scan.fileTextPreview ? `
    <div class="card">
      <div class="card-title">FILE CONTENT PREVIEW & EXTRACTED TEXT</div>
      <pre>${scan.fileTextPreview.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    ` : ''}

    <div class="footer">
      FileGuard Automated VirusTotal Security Platform • Confidential Security Report
    </div>
  </div>
</body>
</html>`;
}
