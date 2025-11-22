"use client"

import { useEffect } from "react"
import { X, ChevronRight, ChevronLeft } from "lucide-react"

interface PortfolioItem {
  id: number
  src: string
  title: string
  location: string
  category: string
}

interface LightboxProps {
  item: PortfolioItem | null
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function Lightbox({ item, onClose, onNext, onPrev }: LightboxProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, onNext, onPrev])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
        <X size={32} />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-6 text-white/50 hover:text-white transition-colors hidden md:block group p-4"
      >
        <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-6 text-white/50 hover:text-white transition-colors hidden md:block group p-4"
      >
        <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="max-w-6xl max-h-[85vh] p-4 flex flex-col items-center">
        <img
          src={item.src || "/placeholder.svg"}
          alt={item.title}
          className="max-h-[75vh] w-auto object-contain shadow-2xl shadow-black mb-6"
        />
        <div className="text-center text-white space-y-2">
          <h3 className="text-3xl font-serif italic">{item.title}</h3>
          <p className="text-xs tracking-[0.3em] uppercase text-white/60">
            {item.location} • {item.category}
          </p>
        </div>
      </div>
    </div>
  )
}
