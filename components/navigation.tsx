"use client"

import { Menu, X } from "lucide-react"

interface NavigationProps {
  activePage: string
  setPage: (page: string) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function Navigation({ activePage, setPage, isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) {
  const links = ["home", "portfolio", "services", "about", "testimonials", "contact"]
  const isHome = activePage === "home"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isHome
          ? "bg-transparent border-white/10 text-white hover:bg-black/20"
          : "bg-white/80 backdrop-blur-md border-stone-100 text-stone-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <button
          onClick={() => setPage("home")}
          className={`text-2xl font-serif tracking-tighter uppercase transition-opacity hover:opacity-70 ${
            isHome ? "text-white" : "text-stone-900"
          }`}
        >
          Luisa.
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => setPage(link)}
              className={`text-xs tracking-[0.2em] uppercase transition-all duration-300 relative group/link ${
                activePage === link ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              {link}
              <span
                className={`absolute -bottom-2 left-0 h-[1px] transition-all duration-300 ${
                  activePage === link ? "w-full" : "w-0 group-hover/link:w-full"
                } ${isHome ? "bg-white" : "bg-stone-900"}`}
              ></span>
            </button>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X size={24} className={isHome ? "text-white" : "text-stone-900"} />
          ) : (
            <Menu size={24} className={isHome ? "text-white" : "text-stone-900"} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white h-screen flex flex-col items-center justify-center gap-8 pb-20 animate-fade-in z-50 text-stone-900">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => {
                setPage(link)
                setIsMobileMenuOpen(false)
              }}
              className="text-2xl font-serif uppercase tracking-widest text-stone-800 hover:text-stone-500"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
