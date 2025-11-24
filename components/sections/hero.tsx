"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowRight, Globe } from "lucide-react"
import { FadeIn } from "../fade-in"
import { HERO_IMAGES } from "@/lib/constants"

interface HeroProps {
  setPage: (page: string) => void
}

export function Hero({ setPage }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth - 0.5) * 2
    const y = (clientY / innerHeight - 0.5) * 2
    setMousePos({ x, y })
  }

  const parallaxStyle = {
    transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
    transition: "transform 0.1s ease-out",
  }

  const bgParallaxStyle = {
    transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px) scale(1.05)`,
    transition: "transform 0.2s ease-out",
  }

  return (
    <div
      className="min-h-screen pt-20 flex flex-col items-center justify-center relative overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Background Slideshow */}
      {HERO_IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? "opacity-80" : "opacity-0"}`}
        >
          <img
            src={img.src || "/placeholder.svg"}
            alt="Hero Background"
            className="w-full h-full object-cover animate-slow-zoom"
            style={bgParallaxStyle}
          />
          <div className="absolute inset-0 bg-black/30"></div>
          {/* Grain Overlay */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
            }}
          ></div>
        </div>
      ))}

      <div className="z-10 text-center text-white px-6 mix-blend-screen" style={parallaxStyle}>
        <FadeIn delay={200}>
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="h-[1px] w-12 bg-white/50"></div>
            <p key={currentSlide} className="text-sm md:text-base tracking-[0.4em] uppercase animate-fade-in">
              {HERO_IMAGES[currentSlide].subtitle}
            </p>
            <div className="h-[1px] w-12 bg-white/50"></div>
          </div>
        </FadeIn>
        <FadeIn delay={400}>
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif mb-10 tracking-tight leading-none shadow-black drop-shadow-2xl">
            Capturing
            <br />
            <span className="italic font-light text-white/90">The Essence</span>
          </h1>
        </FadeIn>
        <FadeIn delay={600}>
          <button
            onClick={() => setPage("portfolio")}
            className="group flex items-center gap-4 mx-auto border border-white/40 bg-white/5 backdrop-blur-sm px-10 py-5 text-xs uppercase tracking-[0.25em] hover:bg-white hover:text-black hover:border-white transition-all duration-700 rounded-sm"
          >
            Explore Portfolio
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
        </FadeIn>
      </div>

      <div className="absolute bottom-12 left-6 md:left-12 z-10 flex items-center gap-3 text-white/90 text-[10px] tracking-[0.3em] uppercase transition-all duration-1000">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <Globe size={12} className="opacity-70" />
        <span key={currentSlide} className="animate-fade-in">
          {HERO_IMAGES[currentSlide].subtitle}
        </span>
      </div>

      <div className="absolute bottom-12 right-6 md:right-12 z-10 flex gap-2">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-12 h-[2px] transition-all duration-500 ${currentSlide === idx ? "bg-white" : "bg-white/20 hover:bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}
