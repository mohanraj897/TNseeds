"use client"

import { createContext, useContext, useState } from 'react'

const UIContext = createContext(null)

export const UIProvider = ({ children }) => {
  const [showSeedForm, setShowSeedForm] = useState(false)

  const openSeedForm  = () => setShowSeedForm(true)
  const closeSeedForm = () => setShowSeedForm(false)

  return (
    <UIContext.Provider value={{ showSeedForm, openSeedForm, closeSeedForm, setShowSeedForm }}>
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}
