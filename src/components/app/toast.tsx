"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import s from "./app.module.css";

interface ToastData {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

type Toast = (message: string, action?: ToastData["action"]) => void;

const ToastContext = createContext<Toast>(() => {});

/** Short confirmations ("Link copied"), optionally with one action such as Undo */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(0);

  const toast = useCallback<Toast>((message, action) => {
    const id = ++nextId.current;
    setToasts((t) => [...t.slice(-2), { id, message, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={s.toasts} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={s.toast}>
            <Check size={15} strokeWidth={3} aria-hidden="true" />
            {t.message}
            {t.action && (
              <button
                type="button"
                className={s.toastAction}
                onClick={() => {
                  t.action?.run();
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
