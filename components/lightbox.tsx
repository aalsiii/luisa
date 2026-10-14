"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft } from "lucide-react"

interface PortfolioItem {
  id: number | string
  src: string
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
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

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

  useEffect(() => {
    setTouchDelta(0)
    setIsSwiping(false)
  }, [item?.id])

  if (!item) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setIsSwiping(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || e.touches.length !== 1) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - touchStart.x
    const diffY = currentY - touchStart.y

    // If movement is predominantly horizontal, track swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setTouchDelta(diffX)
    }
  }

  const handleTouchEnd = () => {
    if (!touchStart) return
    const minSwipeDistance = 45

    if (touchDelta < -minSwipeDistance) {
      // Swiped Left -> Next Image
      onNext()
    } else if (touchDelta > minSwipeDistance) {
      // Swiped Right -> Previous Image
      onPrev()
    }

    setTouchStart(null)
    setTouchDelta(0)
    setIsSwiping(false)
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors z-30 p-2"
        aria-label="Close"
      >
        <X size={30} className="md:w-8 md:h-8" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        className="absolute left-2 md:left-6 text-white/50 hover:text-white transition-colors p-2 md:p-4 z-20 group"
        aria-label="Previous photo"
      >
        <ChevronLeft size={32} className="md:w-10 md:h-10 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className="absolute right-2 md:right-6 text-white/50 hover:text-white transition-colors p-2 md:p-4 z-20 group"
        aria-label="Next photo"
      >
        <ChevronRight size={32} className="md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" />
      </button>

      <div
        className="max-w-6xl max-h-[85vh] p-4 flex flex-col items-center"
        style={{
          transform: isSwiping && touchDelta !== 0 ? `translateX(${touchDelta * 0.75}px)` : "translateX(0px)",
          transition: isSwiping ? "none" : "transform 0.25s ease-out",
        }}
      >
        <img
          src={item.src || "/placeholder.svg"}
          alt={`${item.location} • ${item.category}`}
          draggable={false}
          className="max-h-[75vh] w-auto object-contain shadow-2xl shadow-black mb-6 pointer-events-none select-none"
        />
        <div className="text-center text-white space-y-2">
          <p className="text-xs tracking-[0.3em] uppercase text-white/60">
            {item.location} • {item.category}
          </p>
        </div>
      </div>
    </div>
  )
}

