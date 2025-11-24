import { Camera, Globe, Heart } from "lucide-react"
import { FadeIn } from "../fade-in"

export function About() {
  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20 flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <FadeIn>
          <div className="relative">
            <img
              src="luisa.jpg"
              alt="Photographer"
              className="w-full h-[600px] object-cover grayscale hover:grayscale-0 transition duration-300 rounded-sm"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 border border-stone-100 shadow-xl hidden md:block">
              <p className="font-serif text-4xl">7+</p>
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
                I’m Luisa Reyes, a Guatemalan photographer and traveler. Traveling and discovering the world is essential
                 to who I am, and being able to fund my journeys through something I genuinely love—photography—feels
                  like a true blessing.
              </p>
              <p>
                I focus on capturing people as they are, without forcing anything, looking for  honesty, not performance.
                 I care deeply about human connection, and I want my sessions to feel meaningful: a moment to look at loved 
                 ones with appreciation, to reconnect, and to remember that our greatest treasure is the people we care about.
              </p>
                <p>
               My work comes from observation and playfulness. I’m drawn to real emotion, natural light, and moments that 
               don’t need to be posed. Photography is my way of paying attention to the world, telling the stories I encounter, 
               and finding beauty in both the mundane and the sacred. If my images feel honest, then I’ve done my job.
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
