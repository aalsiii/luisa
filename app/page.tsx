"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/sections/hero"
import { Portfolio } from "@/components/sections/portfolio"
import { About } from "@/components/sections/about"
import { Services } from "@/components/sections/services"
import { Testimonials } from "@/components/sections/testimonials"
import { Contact } from "@/components/sections/contact"
import { Footer } from "@/components/sections/footer"

export default function App() {
  const [activePage, setPage] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activePage])

  const renderContent = () => {
    switch (activePage) {
      case "home":
        return <Hero setPage={setPage} />
      case "portfolio":
        return <Portfolio />
      case "about":
        return <About />
      case "services":
        return <Services />
      case "testimonials":
        return <Testimonials />
      case "contact":
        return <Contact />
      default:
        return <Hero setPage={setPage} />
    }
  }

  return (
    <div className="bg-white text-stone-900 font-sans min-h-screen selection:bg-stone-200">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-slow-zoom {
          animation: slowZoom 20s linear infinite alternate;
        }
        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>

      <Navigation
        activePage={activePage}
        setPage={setPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="relative">{renderContent()}</main>

      {activePage !== "home" && <Footer setPage={setPage} />}
    </div>
  )
}
