import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl sm:text-2xl';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometrically Woven N & R Monogram Crest in Pure Metallic Gold */}
      <div className={`relative ${iconSize} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#D4AF37]"
        >
          {/* Subtle Outer Diamond & Circle Crest */}
          <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.4" />
          <polygon points="50,4 96,50 50,96 4,50" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="50" cy="50" r="41" stroke="#F2D98D" strokeWidth="0.8" strokeOpacity="0.6" />

          {/* Intertwined Monogram Letter 'N' */}
          <path
            d="M32 68 V32 L48 68 V32"
            stroke="url(#goldGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Intertwined Monogram Letter 'R' */}
          <path
            d="M52 32 H64 C70 32 74 36 74 41 C74 46 70 50 64 50 H52 V68 M63 50 L75 68"
            stroke="url(#goldGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Small Royal Accent Star at Summit */}
          <polygon
            points="50,8 51.5,13 56,13 52.5,15.5 54,20 50,17 46,20 47.5,15.5 44,13 48.5,13"
            fill="#F2D98D"
          />

          <defs>
            <linearGradient id="goldGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F2D98D" />
              <stop offset="0.5" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#AA820A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Royal Wordmark */}
      <div className="flex flex-col text-start">
        <span className={`font-display ${titleSize} font-bold tracking-[0.25em] text-[#F5F1E8] leading-none`}>
          NOIR ROYALE
        </span>
        {showSubtitle && (
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] font-medium mt-1">
            LUXURY DINING
          </span>
        )}
      </div>
    </div>
  );
};
