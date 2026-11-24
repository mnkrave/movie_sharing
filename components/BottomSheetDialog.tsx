"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";

// LIFO stack so nested modal sheets unwind cleanly with Android/iOS back gestures
const openSheetStack: string[] = [];

const DESKTOP_MAX_WIDTH: Record<string, string> = {
  "max-w-sm": "sm:max-w-sm",
  "max-w-md": "sm:max-w-md",
  "max-w-lg": "sm:max-w-lg",
  "max-w-xl": "sm:max-w-xl",
  "max-w-2xl": "sm:max-w-2xl",
  "max-w-3xl": "sm:max-w-3xl",
  "max-w-4xl": "sm:max-w-4xl",
};

interface BottomSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  /** Desktop max-width preset */
  maxWidthClass?: keyof typeof DESKTOP_MAX_WIDTH;
  /** Extra classes applied to the inner modal surface container */
  panelClassName?: string;
  /** "bottom" (default bottom-sheet on < sm) or "top" (e.g. SearchModal) */
  mobilePosition?: "bottom" | "top";
  /** Show interactive mobile drag handle for swipe-to-dismiss (< sm, bottom sheets only) */
  showHandle?: boolean;
}

/**
 * Reusable native `<dialog>` overlay:
 * - Mobile (< 640px): bottom sheet (or top sheet) with GPU swipe-to-dismiss & safe-area support
 * - Desktop (>= 640px): centered modal preserving existing visual appearance
 * - Native top-layer, focus containment, Esc & `closedby="any"` + Safari light-dismiss fallback
 * - Browser history integration so Android Back / iOS swipe-back closes the topmost modal
 */
export function BottomSheetDialog({
  isOpen,
  onClose,
  children,
  ariaLabel,
  ariaLabelledBy,
  maxWidthClass = "max-w-2xl",
  panelClassName = "",
  mobilePosition = "bottom",
  showHandle = mobilePosition === "bottom",
}: BottomSheetDialogProps) {
  const sheetId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const pushedHistoryRef = useRef(false);
  const closedByPopstateRef = useRef(false);
  const pointerDownOutsideRef = useRef(false);

  // Swipe-to-dismiss tracking (mobile bottom sheet)
  const dragStartYRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);
  const dragDeltaYRef = useRef<number>(0);

  const releaseSheetHistory = useCallback(() => {
    const idx = openSheetStack.lastIndexOf(sheetId);
    if (idx >= 0) openSheetStack.splice(idx, 1);

    if (pushedHistoryRef.current && !closedByPopstateRef.current) {
      pushedHistoryRef.current = false;
      if (typeof window !== "undefined" && window.history.state?.__cineSheet === sheetId) {
        window.history.back();
      }
    }
  }, [sheetId]);

  // Sync open/closed state with native showModal() + History stack
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      closedByPopstateRef.current = false;
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // Already open in top layer
        }
      }

      if (!openSheetStack.includes(sheetId)) {
        openSheetStack.push(sheetId);
      }

      if (typeof window !== "undefined" && !pushedHistoryRef.current) {
        try {
          window.history.pushState(
            { ...(window.history.state || {}), __cineSheet: sheetId },
            ""
          );
          pushedHistoryRef.current = true;
        } catch {
          // Ignore restricted history contexts
        }
      }

      const handlePopState = () => {
        const isTopmost = openSheetStack[openSheetStack.length - 1] === sheetId;
        if (!isTopmost) return;
        if (window.history.state?.__cineSheet !== sheetId) {
          closedByPopstateRef.current = true;
          pushedHistoryRef.current = false;
          if (dialog.open) {
            dialog.close("popstate");
          } else {
            onCloseRef.current();
          }
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        releaseSheetHistory();
      };
    } else if (dialog.open) {
      dialog.close("prop");
    }
  }, [isOpen, sheetId, releaseSheetHistory]);

  const handleNativeClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.style.transform = "";
      dialog.style.transition = "";
    }
    releaseSheetHistory();
    if (isOpen) {
      onCloseRef.current();
    }
  };

  // Safari fallback for light-dismiss when native `closedby="any"` is unsupported
  const isOutsideDialog = (clientX: number, clientY: number) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    if ("closedBy" in HTMLDialogElement.prototype) return;
    pointerDownOutsideRef.current =
      e.target === dialogRef.current && isOutsideDialog(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDialogElement>) => {
    if ("closedBy" in HTMLDialogElement.prototype) return;
    if (
      pointerDownOutsideRef.current &&
      e.target === dialogRef.current &&
      isOutsideDialog(e.clientX, e.clientY)
    ) {
      dialogRef.current?.close("backdrop");
    }
    pointerDownOutsideRef.current = false;
  };

  // Mobile grab-handle drag-to-dismiss (GPU transform)
  const handleDragStart = (e: React.TouchEvent) => {
    if (mobilePosition !== "bottom") return;
    dragStartYRef.current = e.touches[0].clientY;
    dragStartTimeRef.current = Date.now();
    dragDeltaYRef.current = 0;
    if (dialogRef.current) {
      dialogRef.current.style.transition = "none";
    }
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (dragStartYRef.current === null || !dialogRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStartYRef.current);
    dragDeltaYRef.current = dy;
    dialogRef.current.style.transform = `translateY(${dy}px)`;
  };

  const handleDragEnd = () => {
    if (dragStartYRef.current === null || !dialogRef.current) return;
    const dy = dragDeltaYRef.current;
    const elapsed = Math.max(1, Date.now() - dragStartTimeRef.current);
    const velocity = dy / elapsed;
    const dialog = dialogRef.current;

    dragStartYRef.current = null;
    dragDeltaYRef.current = 0;

    if (dy > 90 || (dy > 30 && velocity > 0.5)) {
      dialog.style.transition = "transform 0.18s ease-out";
      dialog.style.transform = "translateY(100%)";
      window.setTimeout(() => {
        if (dialog.open) dialog.close("swipe");
      }, 160);
    } else {
      dialog.style.transition = "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)";
      dialog.style.transform = "translateY(0)";
      window.setTimeout(() => {
        if (dialog) {
          dialog.style.transition = "";
          dialog.style.transform = "";
        }
      }, 220);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as Record<string, string>)}
      data-mobile-pos={mobilePosition}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      onClose={handleNativeClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`sheet-dialog ${DESKTOP_MAX_WIDTH[maxWidthClass] || "sm:max-w-2xl"}`}
    >
      {isOpen && (
        <div
          className={`relative w-full flex flex-col overflow-hidden shadow-2xl ${
            mobilePosition === "bottom"
              ? "rounded-t-3xl sm:rounded-3xl"
              : "rounded-2xl"
          } ${panelClassName}`}
        >
          {showHandle && mobilePosition === "bottom" && (
            <div
              className="sm:hidden flex-shrink-0 pt-2.5 pb-1.5 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onTouchCancel={handleDragEnd}
              onClick={() => dialogRef.current?.close("handle")}
              aria-hidden="true"
            >
              <div className="w-12 h-1.5 bg-slate-600/80 rounded-full" />
            </div>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}
