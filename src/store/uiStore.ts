import { create } from 'zustand';

interface Toast {
  id:      string;
  type:    'success' | 'error' | 'info' | 'warning';
  title:   string;
  message?: string;
}

interface UiStore {
  toasts:     Toast[];
  addToast:   (toast: Omit<Toast, 'id'>) => void;
  removeToast:(id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),
}));
