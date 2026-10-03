"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export interface ToastInfo {
  id: string;
  message: string;
  type?: "success" | "info";
}

interface PwaToastProps {
  toast: ToastInfo | null;
  onClose: () => void;
}

export const PwaToast: React.FC<PwaToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-18 right-4 sm:right-6 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs max-w-sm">
        <div className="w-6 h-6 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={15} />
        </div>
        <p className="font-semibold text-slate-100 flex-1 leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
