"use client";

interface HexViewerProps {
  hexString: string;
}

export function HexViewer({ hexString }: HexViewerProps) {
  const bytes = hexString.split(' ');

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 text-[11px]">
        <span>OFFSET (HEX)</span>
        <span>BINARY MAGIC BYTES (0x00 - 0x1F)</span>
        <span>ASCII DUMP</span>
      </div>

      <div className="grid grid-cols-[100px_1fr_120px] gap-4 items-center">
        <span className="text-cyan-400 font-bold">00000000:</span>
        <div className="flex flex-wrap gap-2 text-emerald-400 font-bold">
          {bytes.map((b, idx) => (
            <span key={idx} className="hover:bg-slate-800 px-1 rounded transition-colors" title={`Byte ${idx}`}>
              {b}
            </span>
          ))}
        </div>
        <span className="text-slate-400 break-all">
          {bytes.map(b => {
            const num = parseInt(b, 16);
            return (num >= 32 && num <= 126) ? String.fromCharCode(num) : '.';
          }).join('')}
        </span>
      </div>
    </div>
  );
}
