'use client'

import { MenuItem } from '@/types/layout-types'
import React, { createContext, useContext } from 'react'

interface MenuContextType {
  filteredMenuItems: MenuItem[]
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({
  children,
  filteredMenuItems
}: {
  children: React.ReactNode
  filteredMenuItems: MenuItem[]
}) {
  return (
    <MenuContext.Provider value={{ filteredMenuItems }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
