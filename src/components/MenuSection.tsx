import React, { useState, useMemo } from 'react';
import { MenuItem, MenuCategory, Language, SelectedAddon } from '../types';
import { translations } from '../data/translations';
import { DishDetailModal } from './DishDetailModal';
import { Search, Plus, Sparkles, Eye, Check, ArrowDownUp, AlertCircle } from 'lucide-react';

interface MenuSectionProps {
  dishes: MenuItem[];
  language: Language;
  onAddToCart: (dish: MenuItem, selectedAddons?: SelectedAddon[]) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  dishes,
  language,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [activeDish, setActiveDish] = useState<MenuItem | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const t = translations[language].menu;

  const categories: { key: MenuCategory | 'all'; label: string }[] = [
    { key: 'all', label: t.allCategories },
    { key: 'signatures', label: t.categories.signatures },
    { key: 'steaks', label: t.categories.steaks },
    { key: 'pasta', label: t.categories.pasta },
    { key: 'international', label: t.categories.international },
    { key: 'seafood', label: t.categories.seafood },
    { key: 'desserts', label: t.categories.desserts },
    { key: 'beverages', label: t.categories.beverages },
  ];

  const processedDishes = useMemo(() => {
    // 1. Filter
    const filtered = dishes.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesName = 
        (item.name?.ar?.toLowerCase().includes(query) ?? false) || 
        (item.name?.en?.toLowerCase().includes(query) ?? false);
      const matchesDesc = 
        (item.description?.ar?.toLowerCase().includes(query) ?? false) || 
        (item.description?.en?.toLowerCase().includes(query) ?? false);
      const matchesIngredient = 
        (Array.isArray(item.ingredients?.ar) && item.ingredients.ar.some((ing) => ing?.toLowerCase().includes(query))) ||
        (Array.isArray(item.ingredients?.en) && item.ingredients.en.some((ing) => ing?.toLowerCase().includes(query)));

      return matchesCategory && (matchesName || matchesDesc || matchesIngredient);
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') {
        const nameA = a.name?.[language] || a.name?.en || '';
        const nameB = b.name?.[language] || b.name?.en || '';
        return nameA.localeCompare(nameB);
      }
      return 0; // default order
    });
  }, [dishes, selectedCategory, searchQuery, sortBy, language]);

  const handleQuickAdd = (dish: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dish.isAvailable) return;
    onAddToCart(dish);
    setRecentlyAddedId(dish.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1500);
  };

  return (
    <section id="menu" className="relative py-28 bg-[#080808] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.kicker}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F5F1E8] mb-4 tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-[#F5F1E8]/70 leading-relaxed font-light text-balance">
            {t.subtitle}
          </p>
        </div>

        {/* Filter Bar, Sort & Search Container */}
        <div className="space-y-4 mb-12">
          
          {/* Category Tabs (Segmented controls per anti-slop guidelines) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-white/10 rounded-sm overflow-x-auto w-full scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider font-medium rounded-sm whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#080808] font-semibold shadow-sm'
                      : 'text-[#F5F1E8]/70 hover:text-[#F5F1E8] hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar + Sorting Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Instant Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#F5F1E8]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-sm text-xs text-[#F5F1E8] placeholder-[#F5F1E8]/40 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-xs text-[#F5F1E8]/40 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <ArrowDownUp className="w-3.5 h-3.5 text-[#D4AF37]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-[#141414] border border-white/10 rounded-sm text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <option value="default">{t.sortDefault}</option>
                <option value="price-asc">{t.sortPriceAsc}</option>
                <option value="price-desc">{t.sortPriceDesc}</option>
                <option value="name">{t.sortName}</option>
              </select>
            </div>

          </div>

        </div>

        {/* Editorial Culinary Grid */}
        {processedDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedDishes.map((dish) => {
              const isAdded = recentlyAddedId === dish.id;

              return (
                <div
                  key={dish.id}
                  onClick={() => setActiveDish(dish)}
                  className={`group bg-[#141414] border rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer ${
                    !dish.isAvailable 
                      ? 'border-white/5 opacity-80' 
                      : 'border-white/10 hover:border-[#D4AF37]/40'
                  }`}
                >
                  {/* Lead with Imagery */}
                  <div className="relative h-64 overflow-hidden bg-black/60">
                    <img
                      src={dish.image}
                      alt={dish.name?.[language] || dish.name?.en || 'Noir Royale'}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
                    
                    {/* Chef Recommendation Tag */}
                    {dish.isChefRecommendation && (
                      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-semibold text-[#D4AF37] bg-black/85 px-2.5 py-1 border border-[#D4AF37]/30">
                        {t.chefRecommended}
                      </span>
                    )}

                    {/* Availability Badge */}
                    <span className={`absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm border ${
                      dish.isAvailable
                        ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
                        : 'text-rose-400 bg-rose-950/80 border-rose-500/40'
                    }`}>
                      {dish.isAvailable ? t.inStock : t.soldOut}
                    </span>

                    {/* Quick View Overlay Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F5F1E8] bg-[#080808]/90 border border-[#D4AF37]/50 rounded-sm">
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{t.viewDetails}</span>
                      </span>
                    </div>
                  </div>

                  {/* Clean Content Area */}
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Unboxed Metadata with Bullet Separator */}
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">
                        <span>{dish.origin?.[language] || dish.origin?.en || ''}</span>
                        {(dish.tags?.[language]?.[0] || dish.tags?.en?.[0]) && (
                          <>
                            <span aria-hidden="true" className="text-white/20">·</span>
                            <span>{dish.tags?.[language]?.[0] || dish.tags?.en?.[0]}</span>
                          </>
                        )}
                      </div>

                      {/* Dish Title */}
                      <h3 className="font-display text-xl font-bold text-[#F5F1E8] group-hover:text-[#D4AF37] transition-colors leading-snug mb-3">
                        {dish.name?.[language] || dish.name?.en || ''}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-[#F5F1E8]/65 line-clamp-2 leading-relaxed font-light mb-6">
                        {dish.description?.[language] || dish.description?.en || ''}
                      </p>
                    </div>

                    {/* Price in Tabular Numerals & Action Row */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-display text-2xl font-bold text-[#F5F1E8] tabular-nums">
                          ${dish.price}
                        </span>
                        <span className="text-[11px] text-[#F5F1E8]/50 ml-1">
                          {t.currencyLabel}
                        </span>
                      </div>

                      {dish.isAvailable ? (
                        <button
                          onClick={(e) => handleQuickAdd(dish, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-sm transition-all duration-300 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white/5 hover:bg-[#D4AF37] text-[#F5F1E8] hover:text-[#080808] border border-white/10 hover:border-[#D4AF37]'
                          }`}
                          aria-label={`Add ${dish.name?.[language] || dish.name?.en || 'dish'} to order`}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{isAdded ? (language === 'ar' ? 'تمت الإضافة' : 'Added') : t.addToOrder}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{t.soldOut}</span>
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-[#F5F1E8]/60 bg-[#141414] border border-white/10 rounded-sm">
            <p className="text-base font-light">
              {language === 'ar' ? 'لم يتم العثور على أطباق تطابق بحثكم.' : 'No culinary dishes matched your criteria.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSortBy('default');
              }}
              className="mt-4 text-xs uppercase tracking-widest text-[#D4AF37] underline cursor-pointer"
            >
              {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        )}

        {/* Curated Preview Notice */}
        <div className="mt-12 text-center text-[11px] text-white/40 tracking-wider font-light">
          {t.previewNotice}
        </div>

      </div>

      {/* Dish Detail Modal */}
      <DishDetailModal
        dish={activeDish}
        language={language}
        onClose={() => setActiveDish(null)}
        onAddToCart={onAddToCart}
      />
    </section>
  );
};
