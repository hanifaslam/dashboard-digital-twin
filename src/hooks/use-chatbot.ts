import { create } from 'zustand'

interface ChatbotState {
  isHidden: boolean
  setIsHidden: (value: boolean) => void
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  activeBuildingId: string | null
  activeRoomId: string | null
  setActiveContext: (
    buildingId: string | null,
    roomId: string | null
  ) => void
}

export const useChatbot = create<ChatbotState>((set) => ({
  isHidden: false,
  setIsHidden: (value) => set({ isHidden: value }),
  isOpen: false,
  setIsOpen: (value) => set({ isOpen: value }),
  activeBuildingId: null,
  activeRoomId: null,
  setActiveContext: (buildingId, roomId) =>
    set({
      activeBuildingId: buildingId,
      activeRoomId: roomId
    })
}))
