import type React from "react"
interface FadeInProps {
  children: React.ReactNode
  delay?: number
}

export function FadeIn({ children, delay = 0 }: FadeInProps) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}>
      {children}
    </div>
  )
}
