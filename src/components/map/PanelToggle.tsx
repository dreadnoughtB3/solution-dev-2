"use client"

import { ChevronLeft } from "lucide-react"

interface PanelToggleProps {
  isOpen: boolean
  onClick: () => void
}

export default function PanelToggle({ isOpen, onClick }: PanelToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-l-md p-2 transition-transform duration-300 ${
        isOpen ? "translate-x-[-320px]" : "translate-x-0"
      }`}
      style={{ zIndex: 20 }}
      aria-label={isOpen ? "パネルを閉じる" : "パネルを開く"}
    >
      <ChevronLeft size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  )
}
