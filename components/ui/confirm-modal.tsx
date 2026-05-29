"use client";

import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "destructive" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "destructive"
}: ConfirmModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with backdrop-filter blur */}
      <div 
        onClick={onCancel}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Card wrapper */}
      <div className="relative w-full max-w-md bg-zinc-950/90 border border-zinc-900 shadow-2xl rounded-2xl p-6 space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            variant === "destructive"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : variant === "warning"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}>
            <AlertCircle className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="space-y-1.5 pr-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              {description}
            </p>
          </div>
        </div>

        {/* Modal Footer / Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all duration-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-md ${
              variant === "destructive"
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20"
                : variant === "warning"
                  ? "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-500/10"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-950/20"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
