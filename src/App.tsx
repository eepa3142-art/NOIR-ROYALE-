/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Language, 
  CartItem, 
  MenuItem, 
  Reservation, 
  PlacedOrder, 
  SelectedAddon,
  RestaurantSettings,
  MediaGalleryItem
} from './types';
import { api } from './services/api';
import { initialMenuItems } from './data/menuData';
import { initialGalleryItems, initialRestaurantSettings } from './data/initialData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { MenuSection } from './components/MenuSection';
import { GallerySection } from './components/GallerySection';
import { AmbianceSection } from './components/AmbianceSection';
import { ReservationSection } from './components/ReservationSection';
import { ReviewsSection } from './components/ReviewsSection';
import { OrderDrawer } from './components/OrderDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { AudioAtmosphere } from './components/AudioAtmosphere';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';
import { Check } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  
  // Dynamic Datasets synced with persistent API layer
  const [dishes, setDishes] = useState<MenuItem[]>(initialMenuItems);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(initialRestaurantSettings);
  const [galleryItems, setGalleryItems] = useState<MediaGalleryItem[]>(initialGalleryItems);

  // Initial data load from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [m, o, r, s, g] = await Promise.all([
          api.getMenu(),
          api.getOrders(),
          api.getReservations(),
          api.getSettings(),
          api.getGallery(),
        ]);
        if (isMounted) {
          if (m && m.length > 0) setDishes(m);
          if (o) setOrders(o);
          if (r) setReservations(r);
          if (s) setSettings(s);
          if (g && g.length > 0) setGalleryItems(g);
        }
      } catch (err) {
        console.error('Failed to load initial data from backend:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cart & UI Modals
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('noirroyale_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync /admin route detection
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Update HTML direction and language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Persist cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('noirroyale_cart_items', JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (dish: MenuItem, selectedAddons?: SelectedAddon[]) => {
    setCartItems((prev) => {
      // If dish with identical add-ons exists, increment quantity
      const existingIndex = prev.findIndex((item) => {
        if (item.dish.id !== dish.id) return false;
        const prevAddonIds = (item.selectedAddons || []).map((a) => a.id).sort().join(',');
        const newAddonIds = (selectedAddons || []).map((a) => a.id).sort().join(',');
        return prevAddonIds === newAddonIds;
      });

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, { dish, quantity: 1, selectedAddons }];
    });

    showToast(
      language === 'ar'
        ? `تمت إضافة ${dish.name.ar} إلى سلة طلبكم الفاخر`
        : `Added ${dish.name.en} to your luxury bag`
    );
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleReservationComplete = async (newRes: Reservation) => {
    const updated = await api.createReservation(newRes);
    setReservations((prev) => [updated, ...prev]);
    showToast(
      language === 'ar'
        ? `تم تأكيد حجزكم بنجاح برمز #${newRes.code}`
        : `Reservation confirmed! Reference #${newRes.code}`
    );
  };

  const handleOrderPlaced = async (newOrder: PlacedOrder) => {
    const updated = await api.createOrder(newOrder);
    setOrders((prev) => [updated, ...prev]);
    showToast(
      language === 'ar'
        ? `تم استلام طلبكم الراقي #${newOrder.code}`
        : `Order #${newOrder.code} dispatched to kitchen brigade`
    );
  };

  const handleScrollToReservations = () => {
    const el = document.getElementById('reservations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F1E8] selection:bg-[#D4AF37]/30 selection:text-white relative">
      {/* Precision Gold Cursor */}
      <CustomCursor />

      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={handleScrollToReservations}
      />

      {/* Main Content Sections */}
      <main>
        {/* Fullscreen Cinematic Hero */}
        <Hero
          language={language}
          settings={settings}
          onOpenReservation={handleScrollToReservations}
        />

        {/* The Story & Culinary Craftsmanship */}
        <StorySection language={language} />

        {/* Interactive Luxury Gastronomic Collection (7 Categories with Pasta & Addons) */}
        <MenuSection
          dishes={dishes}
          language={language}
          onAddToCart={handleAddToCart}
        />

        {/* Visual Photo & Video Gallery with Fullscreen Lightbox */}
        <GallerySection
          galleryItems={galleryItems}
          language={language}
        />

        {/* Ambiance & Private Salons */}
        <AmbianceSection
          language={language}
          onOpenReservation={handleScrollToReservations}
        />

        {/* Real Table Reservation Engine */}
        <ReservationSection
          language={language}
          onReservationComplete={handleReservationComplete}
        />

        {/* Testimonials & Critical Acclaim */}
        <ReviewsSection language={language} />
      </main>

      {/* Haute Order Cart Drawer */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOrderPlaced={handleOrderPlaced}
        onClearCart={handleClearCart}
      />

      {/* Protected Secret Admin Dashboard (/admin) */}
      {isAdminOpen && (
        <AdminDashboard
          language={language}
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.pathname === '/admin') {
              window.history.pushState(null, '', '/');
            } else if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          dishes={dishes}
          orders={orders}
          reservations={reservations}
          settings={settings}
          galleryItems={galleryItems}
          onUpdateDishes={setDishes}
          onUpdateOrders={setOrders}
          onUpdateReservations={setReservations}
          onUpdateSettings={setSettings}
          onUpdateGallery={setGalleryItems}
        />
      )}

      {/* Ambient Acoustic Lounge Controller */}
      <AudioAtmosphere language={language} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#141414] border border-[#D4AF37] text-white text-xs rounded-sm shadow-[0_0_25px_rgba(212,175,55,0.4)] animate-fadeIn">
          <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Check className="w-3 h-3" />
          </span>
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Luxury Footer */}
      <Footer
        language={language}
        settings={settings}
      />
    </div>
  );
}
