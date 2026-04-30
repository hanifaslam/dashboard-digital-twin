import { create } from 'zustand'

interface GlobalErrorDialogStore {
  isOpen: boolean
  message: string
  title: string
  method?: string
  open: (message: string, title?: string, method?: string) => void
  close: () => void
}

export const useGlobalErrorDialog = create<GlobalErrorDialogStore>((set) => ({
  isOpen: false,
  message: '',
  title: 'System Issue',
  method: undefined,
  open: (message, title = 'System Issue', method) =>
    set({ isOpen: true, message, title, method }),
  close: () => set({ isOpen: false, message: '', title: 'System Issue', method: undefined })
}))
