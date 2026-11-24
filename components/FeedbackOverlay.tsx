"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "info" | "success" | "error";

export interface ToastOptions {
  type?: ToastType;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  durationMs?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onPauseChange: (paused: boolean) => void;
}

export function ToastStack({ toasts, onDismiss, onPauseChange }: ToastStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current as (HTMLDivElement & {
      showPopover?: () => void;
      hidePopover?: () => void;
    }) | null;
    if (!el || typeof el.showPopover !== "function" || typeof el.hidePopover !== "function") {
      return;
    }
    try {
      if (toasts.length > 0) {
        if (!el.matches(":popover-open")) {
          el.showPopover();
        }
      } else if (el.matches(":popover-open")) {
        el.hidePopover();
      }
    } catch {
      // Fallback safely to fixed positioning if Popover API rejects state transition
    }
  }, [toasts.length]);

  return (
    <div
      ref={containerRef}
      popover="manual"
      role="region"
      aria-label="Benachrichtigungen"
      onMouseEnter={() => onPauseChange(true)}
      onMouseLeave={() => onPauseChange(false)}
      onFocusCapture={() => onPauseChange(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          onPauseChange(false);
        }
      }}
      className={`fixed top-auto left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 m-0 p-0 border-0 bg-transparent overflow-visible z-[90] flex flex-col gap-2.5 pointer-events-none ${
        toasts.length === 0 ? "hidden" : ""
      }`}
    >
      <div aria-live="polite" aria-atomic="false" className="flex flex-col gap-2.5">
        {toasts.map((toast) => {
          const borderAndTint =
            toast.type === "error"
              ? "border-red-500/40 bg-slate-900/95 text-red-100"
              : toast.type === "success"
                ? "border-emerald-500/40 bg-slate-900/95 text-emerald-50"
                : "border-amber-500/40 bg-slate-900/95 text-slate-100";

          const iconColor =
            toast.type === "error"
              ? "text-red-400"
              : toast.type === "success"
                ? "text-emerald-400"
                : "text-amber-400";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${borderAndTint}`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                {toast.type === "error" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : toast.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-sm leading-snug">
                <p className="font-medium break-words">{toast.message}</p>
                {toast.actionLabel && toast.actionHref && (
                  <Link
                    href={toast.actionHref}
                    onClick={() => onDismiss(toast.id)}
                    className="inline-flex items-center mt-2 min-h-[36px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                  >
                    {toast.actionLabel}
                  </Link>
                )}
                {toast.actionLabel && !toast.actionHref && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onAction?.();
                      onDismiss(toast.id);
                    }}
                    className="inline-flex items-center mt-2 min-h-[36px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Benachrichtigung schließen"
                className="flex-shrink-0 -mr-1.5 -mt-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2.5 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ConfirmDialogModalProps {
  request: (ConfirmDialogOptions & { id: string }) | null;
  onResolve: (confirmed: boolean) => void;
}

export function ConfirmDialogModal({ request, onResolve }: ConfirmDialogModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const resolvedForIdRef = useRef<string | null>(null);
  const pointerDownOutsideRef = useRef(false);

  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (request) {
      resolvedForIdRef.current = null;
      dialog.returnValue = "";
      if (!dialog.open) {
        dialog.showModal();
      }
      requestAnimationFrame(() => {
        cancelBtnRef.current?.focus();
      });
    } else if (dialog.open) {
      dialog.close("dismiss");
    }
  }, [request]);

  const finish = (confirmed: boolean) => {
    if (!request || resolvedForIdRef.current === request.id) return;
    resolvedForIdRef.current = request.id;
    onResolve(confirmed);
  };

  const handleClose = () => {
    const dialog = dialogRef.current;
    const confirmed = dialog?.returnValue === "confirm";
    if (dialog) {
      dialog.returnValue = "";
    }
    finish(confirmed);
  };

  const isOutsideCard = (clientX: number, clientY: number) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClose={handleClose}
      onCancel={(e) => {
        e.preventDefault();
        if (dialogRef.current?.open) {
          dialogRef.current.close("cancel");
        } else {
          finish(false);
        }
      }}
      onPointerDown={(e) => {
        pointerDownOutsideRef.current =
          e.target === dialogRef.current && isOutsideCard(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (
          pointerDownOutsideRef.current &&
          e.target === dialogRef.current &&
          isOutsideCard(e.clientX, e.clientY)
        ) {
          dialogRef.current?.close("cancel");
        }
        pointerDownOutsideRef.current = false;
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md bg-transparent p-0 border-0 text-slate-100 overscroll-contain backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      {request && (
        <div
          ref={cardRef}
          className="rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-2xl flex-shrink-0 ${
                  request.dangerous
                    ? "bg-red-500/15 text-red-400 border border-red-500/25"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="text-base sm:text-lg font-bold text-white leading-snug">
                  {request.title}
                </h2>
                <p id={descId} className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                  {request.message}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6 bg-slate-950/60 border-t border-slate-800/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={() => dialogRef.current?.close("cancel")}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              {request.cancelLabel || "Abbrechen"}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close("confirm")}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                request.dangerous
                  ? "bg-red-500 hover:bg-red-400 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black"
              }`}
            >
              {request.confirmLabel || "Bestätigen"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
