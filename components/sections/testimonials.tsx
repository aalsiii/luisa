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

      <FadeIn delay={600}>
        <div className="mt-32 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-serif italic text-stone-800 mb-8">Have we worked together?</h3>
          <p className="text-stone-500 font-light mb-12">I'd love to hear about your experience.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget
              const formData = new FormData(form)
              const name = formData.get("name")
              const testimonial = formData.get("testimonial")
              const type = formData.get("type")

              const subject = encodeURIComponent(`New Testimonial from ${name}`)
              const body = encodeURIComponent(
                `Name: ${name}\nContext: ${type}\n\nTestimonial:\n${testimonial}`
              )

              window.location.href = `mailto:pezvolador.fotos@gmail.com?subject=${subject}&body=${body}`
            }}
            className="space-y-6 bg-stone-50 p-8 md:p-12 text-left"
          >
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Your Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif"
                placeholder="Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Context (e.g. Wedding, Portrait)</label>
              <input
                type="text"
                name="type"
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif"
                placeholder="Shoot Type"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Your Words</label>
              <textarea
                name="testimonial"
                required
                className="w-full bg-transparent border-b border-stone-300 py-2 h-32 focus:outline-none focus:border-black transition-colors font-serif resize-none"
                placeholder="Share your experience..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors"
            >
              Send Testimonial
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}
