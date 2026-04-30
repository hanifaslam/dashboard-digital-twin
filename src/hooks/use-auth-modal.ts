import { create } from 'zustand'

type AuthTab = 'login' | 'register'

interface AuthModalStore {
  isOpen: boolean
  activeTab: AuthTab
  open: (tab?: AuthTab) => void
  close: () => void
  setTab: (tab: AuthTab) => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  activeTab: 'login',
  open: (tab = 'login') => set({ isOpen: true, activeTab: tab }),
  close: () => set({ isOpen: false }),
  setTab: (tab) => set({ activeTab: tab })
}))
