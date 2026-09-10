"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (msg: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...msg, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0",
              t.type === 'success' && "bg-slate-900/90 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
              t.type === 'error' && "bg-slate-900/90 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
              t.type === 'warning' && "bg-slate-900/90 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
              t.type === 'info' && "bg-slate-900/90 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
            )}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm">
              <h5 className="font-semibold">{t.title}</h5>
              {t.description && <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg: Omit<ToastMessage, 'id'>) => console.log('Toast:', msg)
    };
  }
  return ctx;
}
