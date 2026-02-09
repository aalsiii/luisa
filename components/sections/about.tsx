import React, { useEffect, useState } from "react";
import { Camera, Globe, Heart } from "lucide-react";
import { FadeIn } from "../fade-in";

export function About() {
  // whether the device is considered "mobile" ( <= 767px )
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // whether the image is revealed (color) on mobile
  const [revealed, setRevealed] = useState<boolean>(false);

  useEffect(() => {
    // guard for SSR
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 767px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      // reset mobile reveal state when switching breakpoints
      setRevealed(false);
    };

    // initial
    handleChange(mq);

    // modern browsers: addEventListener, fallback for older: addListener
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleChange);
    } else {
      // @ts-ignore - older types
      mq.addListener(handleChange);
    }

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handleChange);
      } else {
        // @ts-ignore
        mq.removeListener(handleChange);
      }
    };
  }, []);

  // computed classes:
  // - On mobile: apply "grayscale" unless revealed
  // - On md+ : keep md:grayscale and hover:grayscale-0 (unchanged)
  const imgClass = [
    "w-full",
    "h-full",
    "min-h-[600px]",
    "object-cover",
    "transition",
    "duration-300",
    "rounded-sm",
    // mobile toggling
    isMobile ? (revealed ? "" : "grayscale") : "md:grayscale hover:grayscale-0",
  ]
    .filter(Boolean)
    .join(" ");

  // mobile button click handler
  const handleToggle = () => {
    if (!isMobile) return;
    setRevealed((s) => !s);
  };

  return (
    <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20 flex flex-col justify-center">
      <FadeIn>
        <div className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-8">The Artist</p>
          <h2 className="text-4xl md:text-6xl font-serif leading-tight">
            Curious eyes,
            <br />
            <span className="italic text-stone-400">open heart.</span>
          </h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-stretch">
        <FadeIn delay={200}>
          <div className="relative h-full">
            {/* On mobile we use a button wrapper so tapping toggles reveal.
                On desktop it's still clickable but the handler is no-op. */}
            <button
              type="button"
              onClick={handleToggle}
              aria-pressed={isMobile ? revealed : undefined}
              aria-label={isMobile ? (revealed ? "Hide color" : "Reveal color") : "Photograph"}
              className="w-full h-full text-left focus:outline-none focus:ring-4 focus:ring-stone-200 rounded-sm"
            // keep button styles neutral so layout remains the same
            >
              <img src="luisa.jpg" alt="Photographer" className={imgClass} />
            </button>

            <div className="absolute -bottom-6 -right-6 bg-white p-6 border border-stone-100 shadow-xl hidden md:block">
              <p className="font-serif text-4xl">7+</p>
              <p className="text-xs uppercase tracking-widest text-stone-500">Years Experience</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-6 text-stone-600 font-light leading-relaxed">
              <p>
                My name is Luisa Reyes, a Guatemalan photographer and traveler.
              </p>
              <p>
                I seek what is authentic in humanity: the vulnerable, the resilient, the honest moments that often go unnoticed.
              </p>
              <p>
                Traveling and discovering the world is essential to who I am.
              </p>
              <p>
                Being able to keep moving forward with the life I love through photography is only possible because of the people who support me and trust me, and for that, I feel deeply blessed.
              </p>
              <p>
                I focus on capturing people as they are, without masks or performance, seeking connection and meaning.
              </p>
              <p>
                I want my sessions to feel like a moment to look at loved ones with appreciation, to reconnect, and to remember that our greatest treasure is the people we care about.
              </p>
              <p>
                Based nowhere and everywhere, I work wherever light reveals something worth noticing—a story, a face with a deep gaze and an expression no words could ever capture, a color, a delicate fragment of nature.
              </p>
              <p>
                I’ve spent the last decade moving through different countries and cities, observing people with curiosity and playfulness, like a child exploring the world.
              </p>
              <p>
                I enjoy exploring new ways of seeing and expressing, creating unexpected compositions, and approaching photography with an offbeat perspective, always looking for the heart-centered, and keeping in mind that ego is not your amigo.
              </p>
              <p>
                Photography is my way of paying attention to the world, telling the stories I encounter, and finding beauty in both the mundane and the sacred.
              </p>
              <p>
                If my images feel honest, then I’ve done my job.
              </p>

              <div className="flex gap-4 pt-4">
                <Camera className="text-stone-400" size={24} />
                <Globe className="text-stone-400" size={24} />
                <Heart className="text-stone-400" size={24} />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
