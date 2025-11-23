"use client"

import { Instagram, Mail } from "lucide-react"

interface FooterProps {
  setPage: (page: string) => void
}

export function Footer({ setPage }: FooterProps) {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-white text-2xl font-serif tracking-tighter uppercase mb-2">Luisa.</h3>
          <p className="text-xs tracking-widest uppercase">Photography & Art Direction</p>
        </div>

        <div className="flex gap-8 text-xs uppercase tracking-widest">
          <button onClick={() => setPage("portfolio")} className="hover:text-white transition-colors">
            Works
          </button>
          <button onClick={() => setPage("about")} className="hover:text-white transition-colors">
            About
          </button>
          <button onClick={() => setPage("contact")} className="hover:text-white transition-colors">
            Contact
          </button>
        </div>

        <div className="flex gap-4">
          <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Mail size={20} className="hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-800 text-center md:flex justify-between text-[10px] uppercase tracking-widest">
        <p>&copy;Luisa Photography. All rights reserved.</p>
        <p>Designed with silence in mind.</p>
      </div>
    </footer>
  )
}
