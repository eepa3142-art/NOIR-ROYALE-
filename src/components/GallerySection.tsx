import React, { useState } from 'react';
import { Language, MediaGalleryItem } from '../types';
import { translations } from '../data/translations';
import { Camera, ChevronLeft, ChevronRight, X, Play, Maximize2 } from 'lucide-react';

interface GallerySectionProps {
  galleryItems: MediaGalleryItem[];
  language: Language;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  galleryItems,
  language,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'dishes' | 'chef' | 'ambiance' | 'craft'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const t = translations[language].gallery;

  const filters: { key: typeof activeFilter; label: string }[] = [
    { key: 'all', label: t.filters.all },
    { key: 'dishes', label: t.filters.dishes },
    { key: 'chef', label: t.filters.chef },
    { key: 'ambiance', label: t.filters.ambiance },
    { key: 'craft', label: t.filters.craft },
  ];

  const filteredItems = galleryItems.filter((item) => {
    return activeFilter === 'all' || item.category === activeFilter;
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  return (
    <section id="gallery" className="relative py-28 bg-[#080808] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.kicker}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F5F1E8] mb-4 tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-[#F5F1E8]/70 leading-relaxed font-light text-balance">
            {t.subtitle}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-1.5 p-1 bg-[#141414] border border-white/10 rounded-sm">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer ${
                  activeFilter === f.key
                    ? 'bg-[#D4AF37] text-[#080808] shadow-sm'
                    : 'text-[#F5F1E8]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative h-72 sm:h-80 bg-[#141414] rounded-sm overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={item.image}
                alt={item.title[language]}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Hover Zoom Icon */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>

              {/* Text Caption at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-start">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block mb-1">
                  {item.category}
                </span>
                <h4 className="font-display text-base font-bold text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                  {item.title[language]}
                </h4>
                <p className="text-xs text-white/60 line-clamp-1 mt-1 font-light">
                  {item.caption[language]}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white p-2 rounded-full bg-black/60 border border-white/20 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors cursor-pointer"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors cursor-pointer"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image Box */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].image}
              alt={filteredItems[lightboxIndex].title[language]}
              className="max-w-full max-h-[72vh] object-contain rounded-sm border border-[#D4AF37]/30 shadow-2xl"
            />
            
            <div className="mt-4 text-center text-white max-w-xl">
              <h3 className="font-display text-xl font-bold text-[#F5F1E8]">
                {filteredItems[lightboxIndex].title[language]}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 font-light">
                {filteredItems[lightboxIndex].caption[language]}
              </p>
              <span className="text-[11px] text-[#D4AF37] tracking-widest mt-2 block font-mono">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
