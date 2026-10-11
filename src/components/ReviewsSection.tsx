import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Star, Quote, Award } from 'lucide-react';

interface ReviewsSectionProps {
  language: Language;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ language }) => {
  const t = translations[language].reviews;

  return (
    <section id="reviews" className="relative py-28 bg-[#080808] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.kicker}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F5F1E8] mb-4 tracking-tight">
            {t.title}
          </h2>
          <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto opacity-60" />
        </div>

        {/* Testimonials Grid (Attributable with Name, Role, Concrete Experience) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.items.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#121212] border border-white/10 hover:border-[#D4AF37]/40 p-8 rounded-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* 5-Star Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-white/10" />
                </div>

                <p className="text-sm sm:text-base text-[#F5F1E8]/80 italic leading-relaxed mb-6 font-light">
                  {item.quote}
                </p>
              </div>

              {/* Attributable Author Info */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="font-display text-base font-bold text-[#F5F1E8]">
                  {item.author}
                </h4>
                <p className="text-xs uppercase tracking-wider text-[#D4AF37] mt-0.5">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Michelin Guide Accolade Banner */}
        <div className="mt-16 p-8 bg-[#121212]/50 border border-[#D4AF37]/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center bg-[#080808]">
              <Award className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-display text-lg font-bold text-white">
                {language === 'ar' ? 'تصنيف دليل ميشلان والذواقة الدولية' : 'Michelin Guide & International Gastronomy Laurels'}
              </h4>
              <p className="text-xs text-[#F5F1E8]/60 font-light">
                {language === 'ar' ? 'تكريم متواصل للجودة الاستثنائية وفلسفة التعتيق والضيافة الملكية' : 'Continuous international distinction for dry-aging mastery and culinary intimacy.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs tracking-widest uppercase text-[#D4AF37] font-semibold">
            <span>MICHELIN 2026</span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span>WORLD'S 50 BEST</span>
          </div>
        </div>

      </div>
    </section>
  );
};
