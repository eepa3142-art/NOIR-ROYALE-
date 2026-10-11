import React, { useState } from 'react';
import { Language, RestaurantSettings } from '../types';
import { translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { MapPin, Clock, Sparkles, Send, Check } from 'lucide-react';

interface FooterProps {
  language: Language;
  settings: RestaurantSettings;
}

export const Footer: React.FC<FooterProps> = ({ 
  language, 
  settings, 
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = translations[language].footer;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  return (
    <footer id="contact" className="relative bg-[#050505] text-[#F5F1E8] border-t border-white/10 pt-20 pb-12 overflow-hidden">
      {/* Golden Aura Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[850px] h-48 bg-[#D4AF37]/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand Crest & Master Motto */}
        <div className="text-center max-w-3xl mx-auto mb-16 pb-16 border-b border-white/10 flex flex-col items-center">
          <BrandLogo size="lg" showSubtitle={true} className="mb-4" />
          <p className="font-display text-sm sm:text-base tracking-[0.25em] uppercase text-[#D4AF37] font-medium mb-4">
            {t.tagline}
          </p>
          <p className="text-sm text-[#F5F1E8]/70 font-light max-w-xl mx-auto leading-relaxed">
            {settings.description[language]}
          </p>
        </div>

        {/* 4-Column Grid: Global Salons, Hours, Dress Code, Newsletter Society */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Global Salons */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.locationsTitle}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F5F1E8]/75 font-light leading-relaxed">
              <li className="hover:text-white transition-colors">{settings.addresses.dubai}</li>
              <li className="hover:text-white transition-colors">{settings.addresses.london}</li>
              <li className="hover:text-white transition-colors">{settings.addresses.paris}</li>
              <li className="hover:text-white transition-colors">{settings.addresses.tokyo}</li>
            </ul>
          </div>

          {/* Column 2: Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.hoursTitle}</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#F5F1E8]/75 font-light leading-relaxed">
              <li>{settings.hours.weekdays}</li>
              <li>{settings.hours.weekends}</li>
              <li className="text-amber-200/60">{settings.hours.closed}</li>
            </ul>
          </div>

          {/* Column 3: Dress Code */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.dressCodeTitle}</span>
            </h4>
            <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
              {settings.dressCode[language]}
            </p>
            <p className="text-xs text-[#D4AF37] font-mono mt-2">
              {settings.phone} · {settings.email}
            </p>
          </div>

          {/* Column 4: Private Society Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              {t.newsletterTitle}
            </h4>
            <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
              {t.newsletterDesc}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-l-sm text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="px-4 bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] text-xs font-semibold uppercase tracking-wider rounded-r-sm transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {isSubscribed && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>{t.subscribeSuccess}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Line: Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F1E8]/50 font-light">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-6">
            <a href="#home" className="hover:text-[#D4AF37] transition-colors">
              {language === 'ar' ? 'العودة للأعلى' : 'Return to Summit'}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
