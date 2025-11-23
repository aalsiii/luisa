import { Star } from "lucide-react"
import { FadeIn } from "../fade-in"
import { TESTIMONIALS } from "@/lib/constants"

export function Testimonials() {
  return (
    <div className="min-h-screen pt-32 px-6 max-w-5xl mx-auto pb-20 flex flex-col justify-center">
      <FadeIn>
        <div className="text-center mb-20">
          <Star size={20} className="mx-auto mb-4 text-stone-400" />
          <h2 className="text-3xl md:text-4xl font-serif italic text-stone-800">"Stories told by others"</h2>
        </div>
      </FadeIn>
      <div className="grid grid-cols-1 gap-12">
        {TESTIMONIALS.map((t, idx) => (
          <FadeIn key={idx} delay={idx * 200}>
            <div className="flex flex-col items-center text-center">
              <p className="text-xl md:text-3xl font-light text-stone-800 leading-snug max-w-3xl mb-8">"{t.text}"</p>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-serif uppercase tracking-widest">{t.author}</span>
                <span className="text-xs text-stone-400 tracking-wide">{t.type}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
