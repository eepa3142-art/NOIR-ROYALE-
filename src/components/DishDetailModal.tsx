import React, { useState } from 'react';
import { MenuItem, Language, SelectedAddon } from '../types';
import { translations } from '../data/translations';
import { X, Sparkles, Plus, Wine, MapPin, ChefHat, Check, AlertCircle } from 'lucide-react';

interface DishDetailModalProps {
  dish: MenuItem | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (dish: MenuItem, selectedAddons?: SelectedAddon[]) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  language,
  onClose,
  onAddToCart,
}) => {
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [added, setAdded] = useState(false);
  const t = translations[language].menu;

  if (!dish) return null;

  const toggleAddon = (addon: { id: string; name: { ar: string; en: string }; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        const addonLabel = addon.name?.[language] || addon.name?.en || '';
        return [...prev, { id: addon.id, name: addonLabel, price: addon.price }];
      }
    });
  };

  const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
  const finalDishPrice = (dish.price ?? 0) + addonsTotal;

  const handleAdd = () => {
    if (!dish.isAvailable) return;
    onAddToCart(dish, selectedAddons);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const tagsList = dish.tags?.[language] || dish.tags?.en || [];
  const ingredientsList = dish.ingredients?.[language] || dish.ingredients?.en || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#141414] border border-[#D4AF37]/40 rounded-sm shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-[#F5F1E8] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto">
          {/* Header Image Showcase */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
            <img
              src={dish.image}
              alt={dish.name?.[language] || dish.name?.en || 'Noir Royale'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
            
            {/* Tag & Availability Overlay */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Array.isArray(tagsList) && tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium tracking-wider uppercase text-[#D4AF37] bg-black/80 px-2.5 py-1 rounded-sm border border-[#D4AF37]/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!dish.isAvailable ? (
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-sm">
                    {t.soldOut}
                  </span>
                ) : (
                  <span className="font-display text-2xl font-bold text-[#F5F1E8] tabular-nums">
                    ${finalDishPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Title & Origin */}
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{dish.origin?.[language] || dish.origin?.en || ''}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F1E8] leading-snug">
                {dish.name?.[language] || dish.name?.en || ''}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#F5F1E8]/75 leading-relaxed font-light">
                {dish.description?.[language] || dish.description?.en || ''}
              </p>
            </div>

            {/* Chef Add-Ons Selection (if available) */}
            {dish.addons && dish.addons.length > 0 && dish.isAvailable && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.addonsTitle}</span>
                </h4>
                <div className="space-y-2">
                  {dish.addons.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={`w-full flex items-center justify-between p-3 rounded-sm border transition-all text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-medium'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'border-white/30'}`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                          <span>{addon.name?.[language] || addon.name?.en || ''}</span>
                        </div>
                        <span className="font-mono text-[#D4AF37] font-bold">
                          +${addon.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Ingredients List */}
            {Array.isArray(ingredientsList) && ingredientsList.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.ingredientsTitle}</span>
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-[#F5F1E8]/85">
                  {ingredientsList.map((item, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chef Tasting Vision & Notes */}
            {(dish.chefNotes?.[language] || dish.chefNotes?.en) && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-2 flex items-center gap-2">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{t.chefNotesTitle}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#F5F1E8]/80 italic leading-relaxed">
                  "{dish.chefNotes?.[language] || dish.chefNotes?.en}"
                </p>
              </div>
            )}

            {/* Sommelier Pairing */}
            {(dish.sommelierPairing?.[language] || dish.sommelierPairing?.en) && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-2 flex items-center gap-2">
                  <Wine className="w-3.5 h-3.5" />
                  <span>{t.pairingTitle}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#F5F1E8]/90 font-medium">
                  {dish.sommelierPairing?.[language] || dish.sommelierPairing?.en}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#080808] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#F5F1E8]/50 block">{t.priceLabel}</span>
            <span className="font-display text-2xl font-bold text-[#D4AF37] tabular-nums">
              ${finalDishPrice} <span className="text-xs text-[#F5F1E8]/60 font-sans">{t.currencyLabel}</span>
            </span>
          </div>

          {dish.isAvailable ? (
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.15em] font-semibold rounded-sm transition-all duration-300 cursor-pointer ${
                added 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{added ? (language === 'ar' ? 'تمت الإضافة للطلب' : 'Added to Bag') : t.addToOrder}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/60 px-4 py-2.5 border border-rose-500/30 rounded-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{t.soldOut}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
