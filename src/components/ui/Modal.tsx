"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-full mx-4",
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-hidden animate-fade-in`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && (
              <h3 className="text-lg font-bold text-slate-900">
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition-colors ml-auto"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  close
                </span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center ${
            variant === "danger"
              ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
              : "bg-primary hover:bg-blue-600 shadow-lg shadow-blue-500/20"
          }`}
        >
          {isLoading ? (
             <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
}
