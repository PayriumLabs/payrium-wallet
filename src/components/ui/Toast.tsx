"use client";

import { useEffect, useState } from "react";
import { useUIStore, Toast as ToastType } from "@/stores/ui-store";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const iconMap = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info",
  };

  const bgMap = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-amber-600",
    info: "bg-primary",
  };

  return (
    <div
      className={`${bgMap[toast.type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in ${
        isExiting ? "opacity-0 translate-y-2 transition-all duration-200" : ""
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        {iconMap[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex items-center justify-center size-6 rounded-full hover:bg-white/20 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          close
        </span>
      </button>
    </div>
  );
}
