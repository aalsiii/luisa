import { MapPin, Mail } from "lucide-react"
import { FadeIn } from "../fade-in"
import { CATEGORIES } from "@/lib/constants"

export function Contact() {
  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
      <FadeIn>
        <div>
          <h2 className="text-5xl md:text-7xl font-serif mb-8">
            Let's Create
            <br />
            <span className="italic text-stone-400">Together.</span>
          </h2>
          <p className="text-stone-500 font-light max-w-md mb-12">
            Currently accepting bookings for the 2024 season in Japan, Europe, and North America. Available for travel
            worldwide.
          </p>

          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 text-stone-800" size={20} />
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Current Base</p>
                <p className="font-serif text-lg">Kyoto, Japan</p>
                <p className="text-xs text-stone-400 italic mt-1">Next: Paris (Oct), New York (Nov)</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="mt-1 text-stone-800" size={20} />
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Inquiries</p>
                <p className="font-serif text-lg">hello@lumina-studio.com</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <form className="space-y-8 bg-stone-50 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Name</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Date</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif"
                placeholder="Preferred date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Category</label>
            <select className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif text-stone-600">
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Message</label>
            <textarea
              className="w-full bg-transparent border-b border-stone-300 py-2 h-32 focus:outline-none focus:border-black transition-colors font-serif resize-none"
              placeholder="Tell me about your vision..."
            ></textarea>
          </div>

          <button className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors">
            Send Request
          </button>
        </form>
      </FadeIn>
    </div>
  )
}
