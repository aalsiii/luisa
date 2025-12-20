
"use client"

import { useState, useEffect } from "react"
import { FadeIn } from "../fade-in"
import { Lightbox } from "../lightbox"
import { PORTFOLIO_ITEMS, CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"

interface PortfolioItem {
  id: number | string
  category: string
  src: string
  title?: string
  location: string
}

export function Portfolio() {
  const [filter, setFilter] = useState("All")
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Map DB items to match interface
          const dbItems: PortfolioItem[] = data.data.map((item: any) => ({
            id: item._id,
            category: item.category,
            src: item.src,
            location: item.location || "Studio Session"
          }));

          setItems(dbItems);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic portfolio items", error);
        // Fallback to just static items if fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

  useEffect(() => {
    let currentItems = items;
    if (filter !== "All") {
      currentItems = items.filter((item) => item.category === filter);
    }
    setFilteredItems(currentItems);
  }, [filter, items]);

  const handleNext = () => {
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem?.id)
    const nextIndex = (currentIndex + 1) % filteredItems.length
    setSelectedItem(filteredItems[nextIndex])
  }

  const handlePrev = () => {
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem?.id)
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length
    setSelectedItem(filteredItems[prevIndex])
  }

  return (
    <>
      <div className="min-h-screen pt-32 px-6 max-w-[1600px] mx-auto pb-20">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-7xl font-serif">Selected Works</h2>
              <div className="h-[1px] w-20 bg-stone-900"></div>
              <p className="text-stone-500 max-w-md font-light leading-relaxed">
                A curated collection of moments captured around the globe. Life in motion, still.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 justify-end max-w-2xl">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-xs uppercase tracking-[0.2em] transition-all relative py-2 ${filter === cat ? "text-black font-medium" : "text-stone-400 hover:text-black"
                    }`}
                >
                  {cat}
                  {filter === cat && (
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black animate-fade-in"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Masonry Layout */}
        <div key={filter} className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-fade-in">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-8 cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.src || "/placeholder.svg"}
                  className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 grayscale-[0.5]"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-xs uppercase tracking-widest text-black">View Project</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-stone-500 mt-1">{item.category}</p>
                </div>
                <span className="text-[10px] tracking-widest uppercase text-stone-400">{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} onNext={handleNext} onPrev={handlePrev} />
      )}
    </>
  )
}
