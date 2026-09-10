import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'cyber' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none rounded-md";

    const variants = {
      default: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-[0.98]",
      cyber: "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,242,254,0.4)] border border-cyan-300/30 active:scale-[0.98]",
      outline: "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600 hover:text-white",
      secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/60",
      ghost: "text-slate-300 hover:bg-slate-800/80 hover:text-white",
      destructive: "bg-rose-600/90 text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
