import { Camera, Globe, Heart } from "lucide-react"
import { FadeIn } from "../fade-in"

export function About() {
  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20 flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <FadeIn>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=1000&auto=format&fit=crop"
              alt="Photographer"
              className="w-full h-[600px] object-cover grayscale rounded-sm"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 border border-stone-100 shadow-xl hidden md:block">
              <p className="font-serif text-4xl">10+</p>
              <p className="text-xs uppercase tracking-widest text-stone-500">Years Experience</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="space-y-8">
            <p className="text-xs tracking-[0.3em] uppercase text-stone-500">The Artist</p>
            <h2 className="text-4xl md:text-6xl font-serif leading-tight">
              I don't just take photos.
              <br />
              <span className="italic text-stone-400">I collect moments.</span>
            </h2>
            <div className="space-y-6 text-stone-600 font-light leading-relaxed">
              <p>
                My studio is the world. Based nowhere and everywhere, I've spent the last decade traveling through 40+
                countries, capturing the raw essence of the human experience.
              </p>
              <p>
                From the quiet solitude of urban architecture to the chaotic joy of a family reunion, my lens seeks
                authenticity. Whether I'm shooting a high-fashion editorial in Paris or a yoga retreat in the mountains
                of Peru, my approach remains the same: unobtrusive, observant, and deeply artistic.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Camera className="text-stone-400" size={24} />
              <Globe className="text-stone-400" size={24} />
              <Heart className="text-stone-400" size={24} />
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
