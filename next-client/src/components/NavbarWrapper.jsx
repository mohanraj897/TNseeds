"use client"

import Navbar from "./Navbar"
import { useUI } from "@/context/UIContext"

export default function NavbarWrapper() {
  const { openSeedForm } = useUI()
  return <Navbar onAddSeed={openSeedForm} />
}
