import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Users, Crown, Eye, Sparkles } from 'lucide-react';

interface AmbianceSectionProps {
  language: Language;
  onOpenReservation: () => void;
}

export const AmbianceSection: React.FC<AmbianceSectionProps> = ({
  language,
  onOpenReservation,
}) => {
  const [activeSalonIndex, setActiveSalonIndex] = useState(0);
  const t = translations[language].ambiance;

  const salons = [
    {
      id: 'crystal-vault',
      name: t.halls[0].name,
      desc: t.halls[0].desc,
      capacity: t.halls[0].capacity,
      image: '/src/assets/images/dining_crystal_hall_1791697197687.jpg',
      features: language === 'ar' 
        ? ['ثريا بوهيمية عملاقة', 'خادم شخصي مخصص', 'مدخل VIP خاص وسري', 'قائمة تذوق مصممة خصيصاً']
        : ['Grand Bohemian Crystal Chandelier', 'Dedicated Private Butler', 'Discreet VIP Private Entrance', 'Custom Tailored Degustation Menu'],
    },
    {
      id: 'grand-salon',
      name: t.halls[1].name,
      desc: t.halls[1].desc,
      capacity: t.halls[1].capacity,
      image: '/src/assets/images/hero_luxe_dining_1791697165592.jpg',
      features: language === 'ar'
        ? ['رخام نيرو ماركوينا الإيطالي', 'شموع طبيعية متلألئة', 'عزف بيانو حي كل مساء', 'كراسي مخملية ملكية']
        : ['Italian Nero Marquina Marble', 'Flickering Artisan Candles', 'Live Salon Piano Acoustics', 'Bespoke Velvet Armchairs'],
    },
    {
      id: 'chefs-counter',
      name: t.halls[2].name,
      desc: t.halls[2].desc,
      capacity: t.halls[2].capacity,
      image: '/src/assets/images/dish_wagyu_steak_1791697177267.jpg',
      features: language === 'ar'
        ? ['8 مقاعد فقط حول منصة الشيف', 'تفاعل مباشر مع الطهاة', 'سكب وتعتيق مباشر للأطباق', 'أندر المكونات الحصرية']
        : ['8 Intimate Front-Row Seats', 'Direct Dialogue with Master Chefs', 'Live Plating & Sear Theater', 'Exclusive Cellar Pourings'],
    },
    {
      id: 'skyline-terrace',
      name: t.halls[3].name,
      desc: t.halls[3].desc,
      capacity: t.halls[3].capacity,
      image: '/src/assets/images/dish_caviar_seafood_1791697187291.jpg',
      features: language === 'ar'
        ? ['إطلالة أفقية ساحرة', 'مدافئ رخامية مدمجة', 'مشروبات نادرة تحت النجوم', 'جلسات خارجية مريحة']
        : ['Iconic Skyline Night Vista', 'Recessed Hearth Marble Heaters', 'Rare Elixirs Under the Stars', 'Protected Lounge Architecture'],
    },
  ];

  const currentSalon = salons[activeSalonIndex];

  return (
    <section id="ambiance" className="relative py-28 bg-[#080808] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.kicker}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F5F1E8] mb-4 tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-[#F5F1E8]/70 leading-relaxed font-light text-balance">
            {t.subtitle}
          </p>
        </div>

        {/* Salon Selector Tabs (Clean segmented buttons) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-[#121212] border border-white/10 rounded-sm">
            {salons.map((salon, index) => {
              const isActive = activeSalonIndex === index;
              return (
                <button
                  key={salon.id}
                  onClick={() => setActiveSalonIndex(index)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#080808] shadow-md'
                      : 'text-[#F5F1E8]/70 hover:text-[#F5F1E8] hover:bg-white/5'
                  }`}
                >
                  {salon.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Salon Showcase Card (Split Screen Editorial) */}
        <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-sm overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          
          {/* Visual Showcase (7 columns) */}
          <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[500px]">
            <img
              src={currentSalon.image}
              alt={currentSalon.name}
              className="w-full h-full object-cover transition-opacity duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            
            {/* Overlay badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/80 border border-[#D4AF37]/40 px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider text-[#D4AF37]">
              <Users className="w-3.5 h-3.5" />
              <span>{currentSalon.capacity}</span>
            </div>
          </div>

          {/* Editorial Content (5 columns) */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'القاعة المختارة' : 'Featured Salon'}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F1E8] mb-4 leading-snug">
                {currentSalon.name}
              </h3>
              <p className="text-sm sm:text-base text-[#F5F1E8]/75 leading-relaxed font-light mb-8">
                {currentSalon.desc}
              </p>

              {/* Distinctive Salon Features */}
              <div className="space-y-3 pt-6 border-t border-white/10 mb-8">
                <span className="text-xs uppercase tracking-[0.15em] text-[#D4AF37] block font-semibold">
                  {language === 'ar' ? 'مزايا القاعة الحصرية' : 'Exclusive Salon Amenities'}
                </span>
                {currentSalon.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F5F1E8]/90">
                    <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquire & Reserve Button */}
            <button
              onClick={onOpenReservation}
              className="w-full py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-semibold text-[#080808] bg-[#D4AF37] hover:bg-[#F3E5AB] rounded-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(212,175,55,0.45)] cursor-pointer"
            >
              {language === 'ar' ? 'حجز هذه القاعة الفاخرة' : 'Inquire for this Salon'}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
