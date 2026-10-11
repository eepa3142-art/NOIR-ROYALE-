import { 
  MenuItem, 
  PlacedOrder, 
  Reservation, 
  RestaurantSettings, 
  MediaGalleryItem 
} from '../types';
import { initialMenuItems } from '../data/menuData';
import { initialGalleryItems, initialRestaurantSettings } from '../data/initialData';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';

const TOKEN_KEY = 'noirroyale_auth_token_v3';

function getAuthHeader(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeDish(dish: any): MenuItem {
  const fallback = initialMenuItems.find((m) => m.id === dish?.id);
  const name = dish?.name && typeof dish.name === 'object' 
    ? { ar: dish.name.ar || fallback?.name.ar || '', en: dish.name.en || fallback?.name.en || '' }
    : (fallback?.name || { ar: 'طبق مميز', en: 'Signature Dish' });
  
  const description = dish?.description && typeof dish.description === 'object'
    ? { ar: dish.description.ar || fallback?.description.ar || '', en: dish.description.en || fallback?.description.en || '' }
    : (fallback?.description || { ar: '', en: '' });

  const origin = dish?.origin && typeof dish.origin === 'object'
    ? { ar: dish.origin.ar || fallback?.origin.ar || '', en: dish.origin.en || fallback?.origin.en || '' }
    : (fallback?.origin || { ar: 'مطبخ نوار رويال', en: 'Noir Royale Kitchen' });

  const tags = dish?.tags && typeof dish.tags === 'object'
    ? { 
        ar: Array.isArray(dish.tags.ar) ? dish.tags.ar : (fallback?.tags?.ar || []), 
        en: Array.isArray(dish.tags.en) ? dish.tags.en : (fallback?.tags?.en || []) 
      }
    : (fallback?.tags || { ar: ['طبق مميز'], en: ["Chef's Signature"] });

  const ingredients = dish?.ingredients && typeof dish.ingredients === 'object'
    ? { 
        ar: Array.isArray(dish.ingredients.ar) ? dish.ingredients.ar : (fallback?.ingredients?.ar || []), 
        en: Array.isArray(dish.ingredients.en) ? dish.ingredients.en : (fallback?.ingredients?.en || []) 
      }
    : (fallback?.ingredients || { ar: [], en: [] });

  const chefNotes = dish?.chefNotes && typeof dish.chefNotes === 'object'
    ? { ar: dish.chefNotes.ar || fallback?.chefNotes?.ar || '', en: dish.chefNotes.en || fallback?.chefNotes?.en || '' }
    : (fallback?.chefNotes || { ar: '', en: '' });

  const sommelierPairing = dish?.sommelierPairing && typeof dish.sommelierPairing === 'object'
    ? { ar: dish.sommelierPairing.ar || fallback?.sommelierPairing?.ar || '', en: dish.sommelierPairing.en || fallback?.sommelierPairing?.en || '' }
    : (fallback?.sommelierPairing || { ar: '', en: '' });

  return {
    id: dish?.id || fallback?.id || `dish-${Date.now()}`,
    name,
    category: dish?.category || fallback?.category || 'signatures',
    price: typeof dish?.price === 'number' ? dish.price : (fallback?.price ?? 100),
    currency: dish?.currency || fallback?.currency || 'USD',
    image: (dish?.image || fallback?.image || '').replace(/^\/src\/assets\/images\//, '/images/'),
    description,
    ingredients,
    chefNotes,
    sommelierPairing,
    origin,
    tags,
    isChefRecommendation: Boolean(dish?.isChefRecommendation ?? fallback?.isChefRecommendation),
    isAvailable: dish?.isAvailable !== undefined ? Boolean(dish.isAvailable) : true,
    addons: Array.isArray(dish?.addons) ? dish.addons : (fallback?.addons || []),
  };
}

export const api = {
  // --- AUTHENTICATION ---
  isAuthenticated(): boolean {
    const hasServerToken = Boolean(sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY));
    const isFirebaseOwner = Boolean(
      auth.currentUser && 
      auth.currentUser.email?.toLowerCase() === 'eepa3142@gmail.com'
    );
    return hasServerToken || isFirebaseOwner;
  },

  getOwnerEmail(): string {
    return 'eepa3142@gmail.com';
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  // 1. Password Login via Server
  async login(email: string, pass: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Authentication server unavailable' };
    }
  },

  // 2. Google OAuth via Firebase Authentication (Direct Cloud Role)
  async loginWithGoogle(): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (email === 'eepa3142@gmail.com') {
        // Also obtain or simulate server token for unified APIs
        sessionStorage.setItem(TOKEN_KEY, `fb_owner_${result.user.uid}`);
        localStorage.setItem(TOKEN_KEY, `fb_owner_${result.user.uid}`);
        return { success: true };
      } else {
        await signOut(auth);
        return { 
          success: false, 
          message: 'Access Denied: Only authorized owner eepa3142@gmail.com is permitted.' 
        };
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      return { 
        success: false, 
        message: err.message || 'Google authentication failed' 
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // Ignore
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; previewCode?: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Password reset code issued for owner account.',
        previewCode: '948210',
      };
    }
  },

  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Server unavailable for password reset.' };
    }
  },

  // --- MENU (FIRESTORE FIRST WITH SERVER FALLBACK) ---
  async getMenu(): Promise<MenuItem[]> {
    try {
      // Read directly from Cloud Firestore catalog
      const snap = await getDocs(collection(db, 'menu'));
      if (!snap.empty) {
        const dishes = snap.docs.map((d) => normalizeDish({ id: d.id, ...d.data() }));
        if (dishes.length > 0) return dishes;
      }
    } catch (err) {
      console.warn('Firestore menu read fallback to API:', err);
    }

    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeDish);
        }
      }
    } catch (err) {
      console.warn('API menu read fallback:', err);
    }

    const local = localStorage.getItem('noirroyale_menu_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeDish);
      } catch {
        // Ignore
      }
    }
    return initialMenuItems;
  },

  async saveMenuItem(dish: MenuItem): Promise<MenuItem[]> {
    // 1. Sync to Cloud Firestore if owner session exists
    try {
      await setDoc(doc(db, 'menu', dish.id), dish);
    } catch (err) {
      console.warn('Firestore direct write error, syncing via server:', err);
    }

    // 2. Sync to Server API
    try {
      const exists = (await this.getMenu()).some((d) => d.id === dish.id);
      const url = exists ? `/api/menu/${dish.id}` : '/api/menu';
      const method = exists ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(dish),
      });
    } catch (err) {
      console.warn('Server sync error:', err);
    }

    return await this.getMenu();
  },

  async deleteMenuItem(id: string): Promise<MenuItem[]> {
    // 1. Sync to Firestore
    try {
      await deleteDoc(doc(db, 'menu', id));
    } catch (err) {
      console.warn('Firestore delete error, syncing via server:', err);
    }

    // 2. Sync to Server
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // Ignore
    }

    return await this.getMenu();
  },

  async toggleDishAvailability(id: string): Promise<MenuItem[]> {
    const all = await this.getMenu();
    const target = all.find((d) => d.id === id);
    if (target) {
      const updatedDish = { ...target, isAvailable: !target.isAvailable };
      return await this.saveMenuItem(updatedDish);
    }
    return all;
  },

  // --- ORDERS ---
  async getOrders(): Promise<PlacedOrder[]> {
    if (!this.isAuthenticated()) return [];

    // 1. Attempt Firestore read (succeeds if authenticated as owner in Firebase)
    try {
      if (auth.currentUser?.email?.toLowerCase() === 'eepa3142@gmail.com') {
        const snap = await getDocs(collection(db, 'orders'));
        const orders = snap.docs.map((d) => d.data() as PlacedOrder);
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return orders;
      }
    } catch (err) {
      console.warn('Firestore orders read fallback to backend:', err);
    }

    // 2. Backend verified read
    try {
      const res = await fetch('/api/orders', {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Error fetching orders:', err);
    }
    return [];
  },

  async createOrder(order: PlacedOrder): Promise<PlacedOrder> {
    const orderData: PlacedOrder = {
      ...order,
      id: order.id || `ord-${Date.now()}`,
      code: order.code || `NR-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || 'pending',
    };

    // 1. Persist directly to Cloud Firestore (allowed by security rules for guests)
    try {
      await setDoc(doc(db, 'orders', orderData.id), orderData);
    } catch (err) {
      console.warn('Firestore direct order save error, fallback to server:', err);
    }

    // 2. Persist to Server backend
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderData.items,
          customerName: orderData.guestName,
          customerPhone: orderData.phone,
          deliveryType: orderData.deliveryType,
          address: orderData.address,
          notes: orderData.notes,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          taxAndService: orderData.taxAndService,
          total: orderData.total,
        }),
      });
    } catch {
      // Ignore
    }

    return orderData;
  },

  async updateOrderStatus(orderId: string, status: PlacedOrder['status']): Promise<PlacedOrder[]> {
    // 1. Firestore update
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      console.warn('Firestore order status error, syncing via server:', err);
    }

    // 2. Backend update
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Ignore
    }

    return await this.getOrders();
  },

  async deleteOrder(orderId: string): Promise<PlacedOrder[]> {
    // 1. Firestore delete
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      console.warn('Firestore delete order error:', err);
    }

    // 2. Backend delete
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // Ignore
    }

    return await this.getOrders();
  },

  // --- RESERVATIONS ---
  async getReservations(): Promise<Reservation[]> {
    if (!this.isAuthenticated()) return [];

    // 1. Attempt Firestore read
    try {
      if (auth.currentUser?.email?.toLowerCase() === 'eepa3142@gmail.com') {
        const snap = await getDocs(collection(db, 'reservations'));
        const reservations = snap.docs.map((d) => d.data() as Reservation);
        reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return reservations;
      }
    } catch (err) {
      console.warn('Firestore reservations read fallback:', err);
    }

    // 2. Backend read
    try {
      const res = await fetch('/api/reservations', {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Error fetching reservations:', err);
    }
    return [];
  },

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const resData: Reservation = {
      ...reservation,
      id: reservation.id || `res-${Date.now()}`,
      code: reservation.code || `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: reservation.createdAt || new Date().toISOString(),
      status: reservation.status || 'confirmed',
    };

    // 1. Persist directly to Cloud Firestore (allowed by security rules for guests)
    try {
      await setDoc(doc(db, 'reservations', resData.id), resData);
    } catch (err) {
      console.warn('Firestore direct reservation save error, fallback to server:', err);
    }

    // 2. Persist to Server backend
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resData),
      });
    } catch {
      // Ignore
    }

    return resData;
  },

  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<Reservation[]> {
    // 1. Firestore update
    try {
      await updateDoc(doc(db, 'reservations', reservationId), { status });
    } catch (err) {
      console.warn('Firestore reservation status error:', err);
    }

    // 2. Backend update
    try {
      await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Ignore
    }

    return await this.getReservations();
  },

  async deleteReservation(reservationId: string): Promise<Reservation[]> {
    // 1. Firestore delete
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
    } catch (err) {
      console.warn('Firestore delete reservation error:', err);
    }

    // 2. Backend delete
    try {
      await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // Ignore
    }

    return await this.getReservations();
  },

  // --- SETTINGS ---
  async getSettings(): Promise<RestaurantSettings> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        return snap.data() as RestaurantSettings;
      }
    } catch (err) {
      console.warn('Firestore settings read error, fallback to server:', err);
    }

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.phone) return data;
      }
    } catch {
      // Fallback
    }

    const local = localStorage.getItem('noirroyale_settings_v3');
    return local ? JSON.parse(local) : initialRestaurantSettings;
  },

  async saveSettings(settings: RestaurantSettings): Promise<RestaurantSettings> {
    // 1. Firestore sync
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (err) {
      console.warn('Firestore settings update error:', err);
    }

    // 2. Server sync
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return settings;
  },

  // --- GALLERY ---
  async getGallery(): Promise<MediaGalleryItem[]> {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return initialGalleryItems;
  },
};
