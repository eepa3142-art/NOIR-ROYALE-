import React, { useState } from 'react';
import { Language, RestaurantSettings } from '../types';
import { translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { Calendar, Play, Utensils, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeroProps {
  language: Language;
  settings: RestaurantSettings;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  settings,
  onOpenReservation,
}) => {
  const t = translations[language].hero;
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#080808] pt-28 pb-12"
    >
      {/* Background Layer with Dark Scrim & Golden Ambient Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/src/assets/images/hero_luxe_dining_1791697165592.jpg"
          alt="NOIR ROYALE Grand Dining Sanctuary"
          className="w-full h-full object-cover object-center scale-105 animate-[pulse_14s_ease-in-out_infinite] opacity-40 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Layer of Scrim for high legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/75 to-[#080808]/40" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        
        {/* Subtle Golden Light Flare Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-[#D4AF37]/10 blur-[140px] rounded-full pointer-events-none" />
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto text-center flex flex-col items-center">
        
        {/* Monogram Crest Top Presentation */}
        <div className="mb-6 flex flex-col items-center animate-fadeIn">
          <BrandLogo size="lg" showSubtitle={false} />
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.35em] uppercase text-[#D4AF37] mt-3 font-semibold">
            <span>{t.locationBadge}</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>{t.kicker}</span>
          </div>
        </div>

        {/* Central Master Headline: "الفخامة التي تُذاق" */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#F5F1E8] max-w-5xl leading-[1.08] mb-4 text-balance">
          {settings.headlineSub[language]}
        </h1>

        {/* The Art of Exceptional Dining / فنّ الطعام الاستثنائي */}
        <p className="font-display text-lg sm:text-2xl md:text-3xl tracking-[0.25em] uppercase text-[#D4AF37] mb-6 font-medium">
          {settings.tagline[language]}
        </p>

        {/* Poetic Narrative Description */}
        <p className="max-w-2xl text-base sm:text-lg text-[#F5F1E8]/80 leading-relaxed mb-10 text-balance font-light">
          {settings.description[language]}
        </p>

        {/* Action CTAs: Discover Menu & Reserve Experience */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-lg mb-16">
          {/* Primary Action Button: Explore Menu */}
          <a
            href="#menu"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#080808] bg-[#D4AF37] hover:bg-[#F2D98D] rounded-sm transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-[#080808] group-hover:rotate-12 transition-transform" />
            <span>{t.exploreMenu}</span>
          </a>

          {/* Secondary Action Button: Reserve Experience */}
          <button
            onClick={onOpenReservation}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium text-[#F5F1E8] border border-[#D4AF37]/50 hover:border-[#D4AF37] bg-white/5 hover:bg-[#D4AF37]/10 backdrop-blur-sm rounded-sm transition-all duration-300 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>{t.reserveExperience}</span>
          </button>

          {/* Watch Film Secondary Trigger */}
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#F5F1E8]/80 hover:text-[#D4AF37] transition-colors py-2 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full border border-[#D4AF37]/50 flex items-center justify-center bg-black/40 group-hover:scale-105 transition-transform">
              <Play className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37] translate-x-0.5" />
            </span>
            <span>{t.watchFilm}</span>
          </button>
        </div>

      </div>

      {/* 3 Full-Width Accolades & Sourcing Pillars Strip */}
      <div className="relative z-10 border-t border-white/10 bg-[#080808]/85 backdrop-blur-sm pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-start">
            {t.pillars.map((pillar, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col gap-2 p-4 rounded-sm border border-transparent hover:border-[#D4AF37]/20 hover:bg-[#141414]/60 transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{pillar.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F5F1E8]/70 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cinematic Film Modal Simulation */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl bg-[#141414] border border-[#D4AF37]/40 rounded-sm overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080808]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                <Play className="w-3.5 h-3.5 fill-[#D4AF37]" />
                <span>NOIR ROYALE — The Cinematic Symphony</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-[#F5F1E8]/70 hover:text-white text-sm font-semibold p-1 cursor-pointer"
                aria-label="Close Film Modal"
              >
                ✕
              </button>
            </div>

            {/* Cinematic Video Player Showcase */}
            <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
              <img
                src="/src/assets/images/chef_plating_action_1791702079885.jpg"
                alt="Chef in Action Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white text-xs">
                <div>
                  <h4 className="font-display text-lg font-bold text-[#F5F1E8]">The Master’s Brigade & Flame Theater</h4>
                  <p className="text-white/60">Executive Chef Antoine Moreau</p>
                </div>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border border-white/20 rounded-sm text-xs cursor-pointer hover:border-[#D4AF37]"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-[#D4AF37]" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
                  <span>{isMuted ? 'Unmute Atmosphere' : 'Mute'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
