// stores/notificationStore.ts
import { create } from 'zustand';

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 3, // Giả lập ban đầu
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  clear: () => set({ unreadCount: 0 }),
}));
