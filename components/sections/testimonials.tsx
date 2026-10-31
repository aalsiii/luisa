"use client"

import { useState, useEffect } from "react"
import { Star, CheckCircle2, Loader2 } from "lucide-react"
import { FadeIn } from "../fade-in"
import { TESTIMONIALS } from "@/lib/constants"

interface Testimonial {
  id: string | number
  author: string
  type: string
  text: string
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    testimonial: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" })
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setTestimonials(data.data)
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSubmitSuccess(false)

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: formData.name,
          type: formData.type || "Client Experience",
          text: formData.testimonial,
        }),
      })

      const data = await res.json()
      if (data.success && data.data) {
        // Prepend new testimonial so it appears live immediately
        setTestimonials((prev) => [data.data, ...prev])
        setFormData({ name: "", type: "", testimonial: "" })
        setSubmitSuccess(true)
      } else {
        setErrorMessage(data.error || "Failed to submit testimonial. Please try again.")
      }
    } catch (err: any) {
      console.error("Error submitting testimonial:", err)
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 px-6 max-w-5xl mx-auto pb-20 flex flex-col justify-center">
      <FadeIn>
        <div className="text-center mb-20">
          <Star size={20} className="mx-auto mb-4 text-stone-400" />
          <h2 className="text-3xl md:text-4xl font-serif italic text-stone-800">&quot;Stories told by others&quot;</h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-12">
        {testimonials.map((t, idx) => (
          <FadeIn key={t.id || idx} delay={idx * 150}>
            <div className="flex flex-col items-center text-center">
              <p className="text-xl md:text-3xl font-light text-stone-800 leading-snug max-w-3xl mb-8">
                &quot;{t.text}&quot;
              </p>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-serif uppercase tracking-widest">{t.author}</span>
                <span className="text-xs text-stone-400 tracking-wide">{t.type}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={400}>
        <div className="mt-32 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-serif italic text-stone-800 mb-8">Have we worked together?</h3>
          <p className="text-stone-500 font-light mb-12">I&apos;d love to hear about your experience.</p>

          {submitSuccess && (
            <div className="mb-8 p-6 bg-stone-100 border border-stone-200 text-stone-800 rounded-sm flex items-center justify-center gap-3 animate-fade-in">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-sm tracking-wide">
                Thank you for sharing your experience! Your testimonial is now saved and live.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-stone-50 p-8 md:p-12 text-left">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif disabled:opacity-50"
                placeholder="Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">
                Context (e.g. Wedding, Portrait, Commercial)
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-black transition-colors font-serif disabled:opacity-50"
                placeholder="Shoot Type"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Your Words</label>
              <textarea
                name="testimonial"
                value={formData.testimonial}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-stone-300 py-2 h-32 focus:outline-none focus:border-black transition-colors font-serif resize-none disabled:opacity-50"
                placeholder="Share your experience..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving to Cloudinary...
                </>
              ) : (
                "Send Testimonial"
              )}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}
