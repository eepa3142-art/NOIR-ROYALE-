import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { 
  ShoppingBag, 
  Globe, 
  Calendar, 
  Menu as MenuIcon, 
  X 
} from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenReservation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  cartCount,
  onOpenCart,
  onOpenReservation,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language].nav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: t.home },
    { href: '#menu', label: t.menu },
    { href: '#story', label: t.story },
    { href: '#gallery', label: t.gallery },
    { href: '#reservations', label: t.reservations },
    { href: '#contact', label: t.contact },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#080808]/92 backdrop-blur-md border-b border-[#D4AF37]/20 py-3 shadow-2xl' 
          : 'bg-gradient-to-b from-[#080808]/90 via-[#080808]/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar 3-Zone Contract: Brand Monogram — Single-line Nav Links — Action Controls */}
        <div className="flex items-center justify-between gap-8">
          
          {/* Zone 1: Single element brand wordmark & monogram crest */}
          <a 
            href="#home" 
            className="group flex items-center shrink-0 whitespace-nowrap focus:outline-none"
            aria-label="NOIR ROYALE Homepage"
          >
            <BrandLogo size="md" showSubtitle={true} />
          </a>

          {/* Zone 2: Concise single-line text nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.2em] font-medium text-[#F5F1E8]/80">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 whitespace-nowrap transition-colors hover:text-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#D4AF37] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary reservation action, language toggle & cart trigger */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-[#F5F1E8]/90 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/40 rounded-sm transition-all whitespace-nowrap cursor-pointer"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'EN' : 'العربية'}</span>
            </button>

            {/* Haute Order Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-[#F5F1E8] hover:text-[#D4AF37] transition-colors cursor-pointer"
              aria-label={t.orderCart}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-[#080808] bg-[#D4AF37] rounded-full shadow-lg tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Primary Action Button: Reserve Experience */}
            <button
              onClick={onOpenReservation}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.15em] font-semibold text-[#080808] bg-[#D4AF37] hover:bg-[#F2D98D] rounded-sm transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.reserveTable}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#F5F1E8] hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#080808]/98 border-b border-[#D4AF37]/30 px-6 py-6 transition-all duration-300">
          <nav className="flex flex-col gap-4 text-sm font-medium tracking-wider text-[#F5F1E8]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/5 hover:text-[#D4AF37] transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-3 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReservation();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-semibold text-[#080808] bg-[#D4AF37] rounded-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.reserveTable}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
