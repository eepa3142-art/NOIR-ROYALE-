import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Flame, ChefHat, Sparkles, Compass, Shield, Utensils } from 'lucide-react';

interface StorySectionProps {
  language: Language;
}

export const StorySection: React.FC<StorySectionProps> = ({ language }) => {
  const t = translations[language].story;

  const icons = [Compass, Sparkles, Utensils, Shield];

  return (
    <section id="story" className="relative py-28 bg-[#080808] border-t border-white/5 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#D4AF37]/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#D4AF37]/5 blur-[130px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-4">
            <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.kicker}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F5F1E8] mb-6 tracking-tight leading-snug">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-[#F5F1E8]/70 leading-relaxed font-light max-w-2xl mx-auto text-balance">
            {t.subtitle}
          </p>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mt-6 opacity-60" />
        </div>

        {/* 2-Column Split: Editorial Prose & Large Visual of Chef Brigade */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          
          {/* Column 1: Narrative Story Prose */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-base sm:text-lg text-[#F5F1E8]/85 leading-relaxed font-light">
              {t.paragraph1}
            </p>
            <p className="text-base sm:text-lg text-[#F5F1E8]/75 leading-relaxed font-light">
              {t.paragraph2}
            </p>

            {/* Executive Chef Credential Card */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center bg-[#141414] shrink-0">
                <ChefHat className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-[#F5F1E8] tracking-wider">
                  {t.chefLeadName}
                </h4>
                <p className="text-xs uppercase tracking-[0.15em] text-[#D4AF37]">
                  {t.chefLeadTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Large Visual Asset with Chef Plating */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-sm overflow-hidden border border-[#D4AF37]/30 shadow-2xl group">
              <img
                src="/src/assets/images/chef_plating_action_1791702079885.jpg"
                alt="Chef in Action Plating"
                className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80" />
              
              {/* Image Caption Tag */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs tracking-widest uppercase text-white/90">
                <span className="font-semibold text-[#D4AF37]">The Kitchen Theater</span>
                <span className="text-white/60">Executive Brigade Live</span>
              </div>
            </div>

            {/* Subtle Offset Frame for Architectural Polish */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#D4AF37]/20 -z-10 rounded-sm pointer-events-none hidden sm:block" />
          </div>

        </div>

        {/* 4 Pillars of Excellence Grid: Philosophy, Ingredients, Plating, Hospitality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {t.pillars.map((pillar, idx) => {
            const IconComponent = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="p-6 bg-[#141414]/70 border border-white/10 hover:border-[#D4AF37]/40 rounded-sm transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] mb-4">
                  <IconComponent className="w-4 h-4" />
                </div>
                <h4 className="font-display text-lg font-bold text-[#F5F1E8] mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#F5F1E8]/70 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quantitative Proof Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-8 bg-[#141414]/90 border border-white/10 rounded-sm">
          <div className="flex flex-col items-center text-center">
            <span className="font-display text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums mb-2">
              {t.stat1.number}
            </span>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-[#F5F1E8]/70 max-w-xs font-light">
              {t.stat1.label}
            </p>
          </div>

          <div className="flex flex-col items-center text-center border-y md:border-y-0 md:border-x border-white/10 py-6 md:py-0">
            <span className="font-display text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums mb-2">
              {t.stat2.number}
            </span>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-[#F5F1E8]/70 max-w-xs font-light">
              {t.stat2.label}
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-display text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums mb-2">
              {t.stat3.number}
            </span>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-[#F5F1E8]/70 max-w-xs font-light">
              {t.stat3.label}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
