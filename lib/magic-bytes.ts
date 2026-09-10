export interface MagicSignature {
  name: string;
  extensions: string[];
  mimeTypes: string[];
  signature: number[];
  offset?: number;
}

export const MAGIC_SIGNATURES: MagicSignature[] = [
  {
    name: 'Portable Network Graphics (PNG)',
    extensions: ['png'],
    mimeTypes: ['image/png'],
    signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  },
  {
    name: 'JPEG Image',
    extensions: ['jpg', 'jpeg'],
    mimeTypes: ['image/jpeg', 'image/pjpeg'],
    signature: [0xFF, 0xD8, 0xFF]
  },
  {
    name: 'GIF Image',
    extensions: ['gif'],
    mimeTypes: ['image/gif'],
    signature: [0x47, 0x49, 0x46, 0x38]
  },
  {
    name: 'PDF Document',
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    signature: [0x25, 0x50, 0x44, 0x46] // %PDF
  },
  {
    name: 'ZIP Archive / Office Open XML',
    extensions: ['zip', 'docx', 'xlsx', 'pptx', 'jar', 'apk'],
    mimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/java-archive'
    ],
    signature: [0x50, 0x4B, 0x03, 0x04] // PK..
  },
  {
    name: 'Windows Executable / PE (MZ)',
    extensions: ['exe', 'dll', 'sys', 'drv', 'scr', 'cpl'],
    mimeTypes: ['application/x-msdownload', 'application/x-executable', 'application/octet-stream'],
    signature: [0x4D, 0x5A] // MZ
  },
  {
    name: 'ELF Executable (Linux)',
    extensions: ['elf', 'bin', 'so', 'out'],
    mimeTypes: ['application/x-executable', 'application/x-sharedlib'],
    signature: [0x7F, 0x45, 0x4C, 0x46] // .ELF
  },
  {
    name: 'GZIP Compressed File',
    extensions: ['gz', 'tgz'],
    mimeTypes: ['application/gzip', 'application/x-gzip'],
    signature: [0x1F, 0x8B]
  },
  {
    name: '7-Zip Archive',
    extensions: ['7z'],
    mimeTypes: ['application/x-7z-compressed'],
    signature: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]
  },
  {
    name: 'RAR Archive',
    extensions: ['rar'],
    mimeTypes: ['application/x-rar-compressed', 'application/vnd.rar'],
    signature: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07] // Rar!
  },
  {
    name: 'WebP Image',
    extensions: ['webp'],
    mimeTypes: ['image/webp'],
    signature: [0x52, 0x49, 0x46, 0x46] // RIFF (check WEBP at offset 8)
  },
  {
    name: 'Bitmap Image (BMP)',
    extensions: ['bmp'],
    mimeTypes: ['image/bmp', 'image/x-ms-bmp'],
    signature: [0x42, 0x4D] // BM
  },
  {
    name: 'XML / SVG Vector Image',
    extensions: ['svg', 'xml'],
    mimeTypes: ['image/svg+xml', 'text/xml', 'application/xml'],
    signature: [0x3C, 0x3F, 0x78, 0x6D] // <?xm
  },
  {
    name: 'SVG Direct Tag',
    extensions: ['svg'],
    mimeTypes: ['image/svg+xml'],
    signature: [0x3C, 0x73, 0x76, 0x67] // <svg
  }
];

export function detectMagicBytes(buffer: ArrayBuffer): {
  matchedSignature: MagicSignature | null;
  hexSignature: string;
  detectedName: string;
} {
  const bytes = new Uint8Array(buffer.slice(0, 32));
  const hexSignature = Array.from(bytes.slice(0, 8))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  for (const sig of MAGIC_SIGNATURES) {
    const offset = sig.offset || 0;
    let match = true;

    for (let i = 0; i < sig.signature.length; i++) {
      if (bytes[offset + i] !== sig.signature[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return {
        matchedSignature: sig,
        hexSignature,
        detectedName: sig.name,
      };
    }
  }

  // Check if ASCII text / script
  let isAsciiText = true;
  for (let i = 0; i < Math.min(bytes.length, 16); i++) {
    if (bytes[i] !== 0x09 && bytes[i] !== 0x0A && bytes[i] !== 0x0D && (bytes[i] < 0x20 || bytes[i] > 0x7E)) {
      isAsciiText = false;
      break;
    }
  }

  return {
    matchedSignature: null,
    hexSignature,
    detectedName: isAsciiText ? 'Plain Text / Script' : 'Unknown Binary / Custom Format',
  };
}
