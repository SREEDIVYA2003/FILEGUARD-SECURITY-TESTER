"use client";

import { useEffect, useState } from "react";

export function CyberCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [ringPosition, setRingPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom animated cursor on non-touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if mouse is hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest('button, a, input, select, textarea, [role="button"], [data-cursor="pointer"], .interactive');
        setIsHovered(isInteractive);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  // Smooth ring follow effect using animation frame logic
  useEffect(() => {
    let animId: number;
    const followMouse = () => {
      setRingPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(followMouse);
    };
    animId = requestAnimationFrame(followMouse);
    return () => cancelAnimationFrame(animId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <>
      {/* Global CSS to hide native cursor on desktop */}
      <style jsx global>{`
        @media (pointer: fine) {
          body, a, button, input, select, textarea, [role="button"] {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Cyber Center Precision Pointer Dot */}
      <div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isClicked ? '6px' : '8px',
          height: isClicked ? '6px' : '8px',
          backgroundColor: isHovered ? '#38bdf8' : '#06b6d4',
          boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4',
        }}
      />

      {/* Animated Outer Cyber Reticle Ring */}
      <div
        className="pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/60 transition-all duration-150 ease-out"
        style={{
          left: `${ringPosition.x}px`,
          top: `${ringPosition.y}px`,
          width: isHovered ? '44px' : isClicked ? '24px' : '32px',
          height: isHovered ? '44px' : isClicked ? '24px' : '32px',
          borderColor: isHovered ? '#38bdf8' : '#06b6d4',
          boxShadow: isHovered
            ? '0 0 18px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.2)'
            : '0 0 12px rgba(6, 182, 212, 0.25)',
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
        }}
      >
        {/* Corner Reticle Crosshair Details */}
        <span className="absolute -top-1 left-1/2 h-1.5 w-[2px] -translate-x-1/2 bg-cyan-400/80" />
        <span className="absolute -bottom-1 left-1/2 h-1.5 w-[2px] -translate-x-1/2 bg-cyan-400/80" />
        <span className="absolute -left-1 top-1/2 h-[2px] w-1.5 -translate-y-1/2 bg-cyan-400/80" />
        <span className="absolute -right-1 top-1/2 h-[2px] w-1.5 -translate-y-1/2 bg-cyan-400/80" />
      </div>
    </>
  );
}
