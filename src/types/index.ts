export type Language = 'ar' | 'en';

export type MenuCategory = 
  | 'signatures'
  | 'steaks'
  | 'international'
  | 'seafood'
  | 'pasta'
  | 'desserts'
  | 'beverages';

export interface DishAddon {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  price: number;
}

export interface MenuItem {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  category: MenuCategory;
  price: number; // in USD
  currency: string;
  image: string;
  description: {
    ar: string;
    en: string;
  };
  ingredients: {
    ar: string[];
    en: string[];
  };
  chefNotes: {
    ar: string;
    en: string;
  };
  sommelierPairing: {
    ar: string;
    en: string;
  };
  origin: {
    ar: string;
    en: string;
  };
  tags: {
    ar: string[];
    en: string[];
  };
  isChefRecommendation?: boolean;
  isAvailable: boolean;
  addons?: DishAddon[];
}

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  dish: MenuItem;
  quantity: number;
  selectedAddons?: SelectedAddon[];
  specialInstructions?: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled';

export interface Reservation {
  id: string;
  code: string;
  date: string;
  time: string;
  guests: number;
  seatingArea: string;
  occasion?: string;
  guestName: string;
  phone: string;
  email?: string;
  notes?: string;
  status: ReservationStatus;
  createdAt: string;
}

export type OrderStatus = 'new' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface PlacedOrderItem {
  dishId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedAddons?: SelectedAddon[];
  itemTotal: number;
}

export interface PlacedOrder {
  id: string;
  code: string;
  items: PlacedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAndService: number;
  total: number;
  deliveryType: 'curated_pickup' | 'vip_suite_delivery';
  guestName: string;
  phone: string;
  address?: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface MediaGalleryItem {
  id: string;
  title: {
    ar: string;
    en: string;
  };
  category: 'dishes' | 'chef' | 'ambiance' | 'craft';
  image: string;
  caption: {
    ar: string;
    en: string;
  };
  isVideo?: boolean;
}

export interface RestaurantSettings {
  name: {
    ar: string;
    en: string;
  };
  tagline: {
    ar: string;
    en: string;
  };
  headlineSub: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  phone: string;
  email: string;
  addresses: {
    london: string;
    dubai: string;
    paris: string;
    tokyo: string;
  };
  hours: {
    weekdays: string;
    weekends: string;
    closed: string;
  };
  dressCode: {
    ar: string;
    en: string;
  };
  deliveryFee: number;
  serviceChargePercent: number;
}
