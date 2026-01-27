import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UIState {
  // Modal states
  isModalOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown>;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Toast notifications
  toasts: Toast[];
  
  // Navigation
  activeTab: string;
  
  // Actions
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  activeModal: null,
  modalData: {},
  globalLoading: false,
  loadingMessage: "",
  toasts: [],
  activeTab: "dashboard",
  
  // Actions
  openModal: (modalId, data = {}) => set({
    isModalOpen: true,
    activeModal: modalId,
    modalData: data,
  }),
  
  closeModal: () => set({
    isModalOpen: false,
    activeModal: null,
    modalData: {},
  }),
  
  setGlobalLoading: (loading, message = "") => set({
    globalLoading: loading,
    loadingMessage: message,
  }),
  
  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
