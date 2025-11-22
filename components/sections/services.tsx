import { FadeIn } from "../fade-in"
import { SERVICES } from "@/lib/constants"

export function Services() {
  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20">
      <div className="text-center mb-20">
        <FadeIn>
          <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-4">Investment</p>
          <h2 className="text-4xl md:text-5xl font-serif">Curated Packages</h2>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SERVICES.map((service, idx) => (
          <FadeIn key={idx} delay={idx * 150}>
            <div className="group border border-stone-200 p-10 hover:bg-stone-50 transition-colors duration-500 min-h-[400px] flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif mb-2 group-hover:italic transition-all">{service.title}</h3>
                <div className="w-10 h-[1px] bg-black mb-6"></div>
                <p className="text-stone-500 font-light leading-relaxed mb-6">{service.desc}</p>
              </div>
              <div>
                <p className="text-lg font-medium mb-6">{service.price}</p>
                <button className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-stone-500 hover:border-stone-500 transition-all">
                  Inquire Now
                </button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
