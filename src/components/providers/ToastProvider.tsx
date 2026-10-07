"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Toast from "@/components/common/Toast";
import { TOAST_DURATION_MS } from "@/constants/invitation";

export interface ToastMessage {
  title: string;
  message: string;
}

interface ToastContextValue {
  showToast: (toast: ToastMessage) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

// One success toast for the whole admin. Lives above the pages, so "Invitation issued" still shows
// after the create page sends the admin back to the list
export default function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isPaused, setIsPaused] = useState(false); // mouse or keyboard focus is on the toast

  // Hide after a few seconds, but never while the admin is reading it.
  // Cleanup cancels the timer if the toast changes or gets paused first
  useEffect(() => {
    if (!toast || isPaused) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, isPaused]);

  const showToast = useCallback((next: ToastMessage) => {
    setIsPaused(false);
    setToast(next);
  }, []);

  // Same object every render unless showToast changes, so consumers don't re-render for nothing
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          onDismiss={() => {
            setToast(null);
            setIsPaused(false);
          }}
          onPause={() => setIsPaused(true)}
          onResume={() => setIsPaused(false)}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
