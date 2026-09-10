export interface CWEReference {
  id: string;
  name: string;
  title: string;
  description: string;
  riskImpact: string;
  codeSnippets: {
    nodejs: string;
    python: string;
    java: string;
    php: string;
  };
}

export const CWE_DATABASE: Record<string, CWEReference> = {
  'CWE-434': {
    id: 'CWE-434',
    name: 'Unrestricted Upload of File with Dangerous Type',
    title: 'Arbitrary Code Execution via Executable Upload',
    description: 'The application allows an attacker to upload or transfer files of dangerous types that can be automatically processed within the web root or executed on the underlying system.',
    riskImpact: 'Critical. Remote Code Execution (RCE), full server compromise, persistent backdoor access.',
    codeSnippets: {
      nodejs: `// Safe Express Multer validation with filename hashing and strict mime check
const storage = multer.diskStorage({
  destination: '/tmp/safe_uploads',
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    const safeExt = getSafeExtension(file.originalname);
    cb(null, \`\${randomName}.\${safeExt}\`);
  }
});

const fileFilter = (req, file, cb) => {
  const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'application/pdf'];
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'), false);
  }
};`,
      python: `import uuid
import magic
from pathlib import Path

ALLOWED_MIMETYPES = {'image/png', 'image/jpeg', 'application/pdf'}

def secure_save(uploaded_file, upload_dir):
    # 1. Read header magic bytes
    mime = magic.from_buffer(uploaded_file.read(2048), mime=True)
    uploaded_file.seek(0)
    
    if mime not in ALLOWED_MIMETYPES:
        raise ValueError("Disallowed file content type")
        
    # 2. Store outside web root with random UUID
    ext = Path(uploaded_file.filename).suffix.lower()
    safe_filename = f"{uuid.uuid4()}{ext}"
    target_path = Path(upload_dir) / safe_filename
    
    with open(target_path, 'wb') as f:
        f.write(uploaded_file.read())`,
      java: `// Java Spring Boot Secure File Handler
@PostMapping("/upload")
public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file) {
    Tika tika = new Tika();
    String detectedType = tika.detect(file.getInputStream());
    
    if (!List.of("image/png", "image/jpeg", "application/pdf").contains(detectedType)) {
        return ResponseEntity.badRequest().body("Forbidden file format");
    }
    
    String safeName = UUID.randomUUID().toString() + getSanitizedExtension(file.getOriginalFilename());
    Path targetPath = Paths.get("/var/secure_uploads").resolve(safeName);
    Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
    return ResponseEntity.ok("Saved securely");
}`,
      php: `<?php
// PHP Secure Upload Handler
$allowed_types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'application/pdf' => 'pdf'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($_FILES['file']['tmp_name']);

if (!array_key_exists($mime, $allowed_types)) {
    die("Error: Invalid file content type.");
}

$ext = $allowed_types[$mime];
$secure_name = bin2hex(random_bytes(16)) . '.' . $ext;
$target = '/var/uploads_storage/' . $secure_name;

if (move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
    echo "Uploaded safely";
}
?>`
    }
  },
  'CWE-22': {
    id: 'CWE-22',
    name: 'Improper Limitation of a Pathname to a Restricted Directory',
    title: 'Path Traversal / Arbitrary File Overwrite',
    description: 'The application uses external input to construct a pathname without properly neutralizing special elements like "../" sequence, allowing writes outside the target directory.',
    riskImpact: 'High. Arbitrary file creation/overwrite, system configuration corruption, webshell placement.',
    codeSnippets: {
      nodejs: `import path from 'path';

function getSafePath(baseDir: string, userFilename: string): string {
  // Strip path separators and strip leading dots
  const sanitized = path.basename(userFilename).replace(/[^a-zA-Z0-9_.-]/g, '');
  const finalPath = path.resolve(baseDir, sanitized);
  
  // Verify final path remains strictly inside target directory
  if (!finalPath.startsWith(path.resolve(baseDir))) {
    throw new Error('Path traversal detected');
  }
  return finalPath;
}`,
      python: `import os
from werkzeug.utils import secure_filename

def save_safely(upload_dir, user_filename):
    clean_name = secure_filename(user_filename)
    full_path = os.path.abspath(os.path.join(upload_dir, clean_name))
    
    if not full_path.startswith(os.path.abspath(upload_dir)):
        raise SecurityError("Path traversal attack blocked")
    return full_path`,
      java: `Path baseDir = Paths.get("/var/secure_uploads").toAbsolutePath().normalize();
Path resolvedPath = baseDir.resolve(Paths.get(userFilename).getFileName()).normalize();

if (!resolvedPath.startsWith(baseDir)) {
    throw new SecurityException("Traversal attempt detected");
}`,
      php: `<?php
$basename = basename($_FILES['userfile']['name']);
$sanitized = preg_replace('/[^a-zA-Z0-9_\.-]/', '', $basename);
$target_dir = realpath('/var/secure_uploads/');
$target_file = $target_dir . DIRECTORY_SEPARATOR . $sanitized;

if (strpos(realpath(dirname($target_file)), $target_dir) !== 0) {
    die("Security Exception: Path Traversal detected");
}
?>`
    }
  },
  'CWE-79': {
    id: 'CWE-79',
    name: 'Improper Neutralization of Input During Web Page Generation',
    title: 'Cross-Site Scripting (XSS) via SVG/XML Upload',
    description: 'Vector graphics (SVG) or XML files containing active script elements (<script>, onload attributes, javascript: URIs) executed in the client browser context.',
    riskImpact: 'High. Session hijacking, stored XSS, cookie theft, unauthorized API calls.',
    codeSnippets: {
      nodejs: `import DOMPurify from 'isomorphic-dompurify';

function sanitizeSVG(svgString: string): string {
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [],
    FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'embed', 'object'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover']
  });
}`,
      python: `import defusedxml.ElementTree as ET

def sanitize_xml(xml_content):
    # defusedxml disables entity expansions and XML external entities (XXE)
    tree = ET.fromstring(xml_content)
    # Strip dangerous nodes or convert SVG to PNG using CairoSVG
    return tree`,
      java: `// Serve user uploaded SVG with forced sandbox headers
response.setHeader("Content-Security-Policy", "script-src 'none'");
response.setHeader("Content-Disposition", "attachment; filename=\"vector.svg\"");
response.setContentType("image/svg+xml");`,
      php: `<?php
// Force content disposition inline/attachment to disable HTML execution context
header('Content-Type: image/svg+xml');
header('Content-Security-Policy: script-src \'none\'');
header('Content-Disposition: attachment; filename="file.svg"');
?>`
    }
  },
  'CWE-430': {
    id: 'CWE-430',
    name: 'Deployment of Wrong Content-Type or MIME Header',
    title: 'MIME Type / Magic Byte Mismatch Anomaly',
    description: 'The file extension claims one type (e.g. .pdf or .png) but binary magic byte header reveals executable code or polyglot payload structure.',
    riskImpact: 'High. Content-Sniffing attacks, polyglot exploits, bypass of naive file checks.',
    codeSnippets: {
      nodejs: `import { fileTypeFromBuffer } from 'file-type';

async function verifyMagicBytes(buffer: Buffer, expectedExt: string) {
  const result = await fileTypeFromBuffer(buffer);
  if (!result || result.ext !== expectedExt.replace('.', '')) {
    throw new Error(\`Magic byte mismatch! Detected: \${result?.mime}\`);
  }
}`,
      python: `import magic

def verify_file_header(file_bytes, expected_ext):
    detector = magic.Magic(mime=True)
    detected_mime = detector.from_buffer(file_bytes)
    
    EXPECTED = {'pdf': 'application/pdf', 'png': 'image/png', 'jpg': 'image/jpeg'}
    if EXPECTED.get(expected_ext) != detected_mime:
        raise ValueError(f"Header mismatch: {detected_mime}")`,
      java: `Tika tika = new Tika();
String actualMime = tika.detect(inputStream);
if (!expectedMime.equalsIgnoreCase(actualMime)) {
    throw new IllegalArgumentException("Header signature does not match extension");
}`,
      php: `<?php
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$actual = finfo_buffer($finfo, $file_content);
if ($actual !== $expected_mime) {
    die("Signature mismatch detected.");
}
?>`
    }
  }
};
