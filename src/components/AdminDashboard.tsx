import React, { useState } from 'react';
import { 
  MenuItem, 
  PlacedOrder, 
  Reservation, 
  RestaurantSettings, 
  MediaGalleryItem, 
  Language, 
  MenuCategory 
} from '../types';
import { translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { api } from '../services/api';
import { 
  Lock, 
  LogOut, 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  Calendar, 
  Image as ImageIcon, 
  CheckCircle2, 
  Settings, 
  BarChart3, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  KeyRound,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  language: Language;
  onClose: () => void;
  dishes: MenuItem[];
  orders: PlacedOrder[];
  reservations: Reservation[];
  settings: RestaurantSettings;
  galleryItems: MediaGalleryItem[];
  onUpdateDishes: (dishes: MenuItem[]) => void;
  onUpdateOrders: (orders: PlacedOrder[]) => void;
  onUpdateReservations: (reservations: Reservation[]) => void;
  onUpdateSettings: (settings: RestaurantSettings) => void;
  onUpdateGallery: (items: MediaGalleryItem[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onClose,
  dishes,
  orders,
  reservations,
  settings,
  galleryItems,
  onUpdateDishes,
  onUpdateOrders,
  onUpdateReservations,
  onUpdateSettings,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => api.isAuthenticated());
  const [loginEmail, setLoginEmail] = useState('eepa3142@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Forgot / Reset Password state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('eepa3142@gmail.com');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [previewResetCode, setPreviewResetCode] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'menu' | 'orders' | 'reservations' | 'media' | 'availability' | 'settings' | 'analytics' | 'security'
  >('overview');

  // Edit/Add Dish Modal State
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isAddingNewDish, setIsAddingNewDish] = useState(false);

  // Settings Draft State
  const [settingsDraft, setSettingsDraft] = useState<RestaurantSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const t = translations[language].admin;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setLoginError(false);
    setLoginErrorMessage('');

    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success) {
        setIsAuthenticated(true);
        // Refresh active datasets from authoritative server
        const [freshMenu, freshOrders, freshRes] = await Promise.all([
          api.getMenu(),
          api.getOrders(),
          api.getReservations(),
        ]);
        onUpdateDishes(freshMenu);
        onUpdateOrders(freshOrders);
        onUpdateReservations(freshRes);
      } else {
        setLoginError(true);
        setLoginErrorMessage(
          res.message ||
          (language === 'ar'
            ? 'بيانات الدخول غير صحيحة. يرجى التحقق من بريد المالك وكلمة المرور.'
            : 'Invalid credentials. Access restricted to verified owner.')
        );
      }
    } catch {
      setLoginError(true);
      setLoginErrorMessage(
        language === 'ar'
          ? 'تعذر الاتصال بخادم التحقق'
          : 'Could not contact verification server'
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmittingAuth(true);
    setLoginError(false);
    setLoginErrorMessage('');
    try {
      const res = await api.loginWithGoogle();
      if (res.success) {
        setIsAuthenticated(true);
        const [freshMenu, freshOrders, freshRes] = await Promise.all([
          api.getMenu(),
          api.getOrders(),
          api.getReservations(),
        ]);
        onUpdateDishes(freshMenu);
        onUpdateOrders(freshOrders);
        onUpdateReservations(freshRes);
      } else {
        setLoginError(true);
        setLoginErrorMessage(res.message || 'Google authentication failed');
      }
    } catch (err: any) {
      setLoginError(true);
      setLoginErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDish) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 960;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          setEditingDish({ ...editingDish, image: compressedDataUrl });
          showNotice(language === 'ar' ? 'تم تجهيز الصورة وضغطها بنجاح (سحابي)' : 'Image optimized & ready for cloud');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setResetMessage(null);
    try {
      const res = await api.requestPasswordReset(resetEmail);
      if (res.success) {
        setResetStep(2);
        if (res.previewCode) {
          setPreviewResetCode(res.previewCode);
          setResetCode(res.previewCode);
        }
        setResetMessage(
          language === 'ar'
            ? 'تم إرسال رمز التحقق الخاص بالمالك بنجاح.'
            : 'Reset verification code dispatched to owner account.'
        );
      } else {
        setResetMessage(res.message);
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    try {
      const res = await api.resetPassword(resetEmail, resetCode, newPassword);
      if (res.success) {
        setLoginPassword(newPassword);
        setIsForgotMode(false);
        setResetStep(1);
        setResetMessage(null);
        showNotice(
          language === 'ar'
            ? 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول.'
            : 'New owner password set successfully! You may now sign in.'
        );
      } else {
        setResetMessage(res.message);
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // --- MENU ACTIONS ---
  const handleSaveDish = async (dish: MenuItem) => {
    const updated = await api.saveMenuItem(dish);
    onUpdateDishes(updated);
    setEditingDish(null);
    setIsAddingNewDish(false);
    showNotice(language === 'ar' ? 'تم حفظ بيانات الطبق في قاعدة البيانات' : 'Dish saved to server database');
  };

  const handleDeleteDish = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الطبق نهائياً؟' : 'Are you sure you want to permanently delete this dish?')) {
      const updated = await api.deleteMenuItem(id);
      onUpdateDishes(updated);
      showNotice(language === 'ar' ? 'تم حذف الطبق بنجاح' : 'Dish deleted');
    }
  };

  const handleToggleAvailability = async (id: string) => {
    const updated = await api.toggleDishAvailability(id);
    onUpdateDishes(updated);
    showNotice(language === 'ar' ? 'تم تحديث حالة توفر الطبق فوراً' : 'Availability status updated');
  };

  // --- ORDER ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, status: PlacedOrder['status']) => {
    const updated = await api.updateOrderStatus(orderId, status);
    onUpdateOrders(updated);
    showNotice(language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف سجل هذا الطلب؟' : 'Confirm deleting this order record?')) {
      const updated = await api.deleteOrder(orderId);
      onUpdateOrders(updated);
      showNotice(language === 'ar' ? 'تم حذف سجل الطلب' : 'Order record removed');
    }
  };

  // --- RESERVATION ACTIONS ---
  const handleUpdateReservationStatus = async (resId: string, status: Reservation['status']) => {
    const updated = await api.updateReservationStatus(resId, status);
    onUpdateReservations(updated);
    showNotice(language === 'ar' ? 'تم تحديث حالة الحجز' : 'Reservation status updated');
  };

  const handleDeleteReservation = async (resId: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف سجل هذا الحجز؟' : 'Confirm deleting this reservation record?')) {
      const updated = await api.deleteReservation(resId);
      onUpdateReservations(updated);
      showNotice(language === 'ar' ? 'تم حذف سجل الحجز' : 'Reservation deleted');
    }
  };

  // --- SETTINGS ACTIONS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const saved = await api.saveSettings(settingsDraft);
      onUpdateSettings(saved);
      showNotice(language === 'ar' ? 'تم حفظ إعدادات المطعم في قاعدة البيانات' : 'Restaurant settings saved');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Preset luxury photos for easy dish customization
  const presetDishPhotos = [
    { label: 'A5 Wagyu', url: '/images/dish_wagyu_steak_1791697177267.jpg' },
    { label: 'Truffle Pasta', url: '/images/dish_truffle_pasta_1791702066315.jpg' },
    { label: 'Lobster & Caviar', url: '/images/dish_caviar_seafood_1791697187291.jpg' },
    { label: 'Gold Chocolate', url: '/images/dish_gold_chocolate_1791697208268.jpg' },
    { label: 'Chef Plating', url: '/images/chef_plating_action_1791702079885.jpg' },
    { label: 'Crystal Hall', url: '/images/dining_crystal_hall_1791697197687.jpg' },
  ];

  // KPI Calculations
  const totalRevenue = orders.reduce((acc, o) => (o.status !== 'cancelled' ? acc + o.total : acc), 0);
  const activeReservationsCount = reservations.filter((r) => r.status === 'confirmed').length;

  // --- LOGIN / FORGOT PASSWORD SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-md bg-[#141414] border border-[#D4AF37]/50 rounded-sm p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-1 cursor-pointer"
            aria-label="Close Login"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <BrandLogo size="md" showSubtitle={true} />
            <div className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] uppercase tracking-widest mt-4 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{isForgotMode ? (language === 'ar' ? 'استعادة حساب المالك' : 'Owner Password Recovery') : t.loginTitle}</span>
            </div>
            <p className="text-xs text-white/60 mt-1 font-light">
              {isForgotMode 
                ? (language === 'ar' ? 'التحقق الآمن من بريد المالك وإعادة تعيين كلمة المرور' : 'Secure email verification & master key reset')
                : (language === 'ar' ? 'بوابة إدارة المطعم المحمية للمالك الحصري' : 'Restricted executive management portal')}
            </p>
          </div>

          {actionNotice && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-sm text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          )}

          {!isForgotMode ? (
            /* STANDARD OWNER LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/70 block mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="eepa3142@gmail.com"
                  className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[11px] text-[#D4AF37]/80 mt-1 block">
                  {language === 'ar' ? 'بريد المالك المعتمد: eepa3142@gmail.com' : 'Verified Owner Email: eepa3142@gmail.com'}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs uppercase tracking-wider text-white/70">
                    {t.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setResetStep(1);
                      setResetMessage(null);
                    }}
                    className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-sm text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginErrorMessage || t.invalidCredentials}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingAuth ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <span>{t.loginButton}</span>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#121212] px-2 text-white/40">
                    {language === 'ar' ? 'أو الدخول عبر Firebase Auth' : 'Or via Firebase Auth'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmittingAuth}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z" />
                </svg>
                <span>{language === 'ar' ? 'تسجيل دخول المالك عبر Google' : 'Sign In as Owner with Google'}</span>
              </button>
            </form>
          ) : (
            /* PASSWORD RESET WORKFLOW */
            <div className="space-y-4">
              {resetStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-white/70 block mb-1">
                      {language === 'ar' ? 'أدخل بريد المالك' : 'Owner Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {resetMessage && (
                    <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-sm text-xs text-amber-200">
                      {resetMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                  {previewResetCode && (
                    <div className="p-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-sm text-xs text-[#D4AF37]">
                      {language === 'ar' ? `رمز التحقق المولد: ${previewResetCode}` : `Generated verification code: ${previewResetCode}`}
                    </div>
                  )}

                  <div>
                    <label className="text-xs uppercase tracking-wider text-white/70 block mb-1">
                      {language === 'ar' ? 'رمز التحقق (6 أرقام)' : 'Verification Code (6-digit)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="948210"
                      className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-white/70 block mb-1">
                      {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Master Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {resetMessage && (
                    <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-sm text-xs text-amber-200">
                      {resetMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {language === 'ar' ? 'تأكيد وحفظ كلمة المرور' : 'Confirm New Password'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-xs text-white/60 hover:text-white underline cursor-pointer"
                >
                  {language === 'ar' ? 'الرجوع لشاشة تسجيل الدخول' : 'Back to Login'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-white/40 font-mono">
            {language === 'ar'
              ? 'الوصول محصور حصرياً بمالك المطعم المُعتمد (eepa3142@gmail.com)'
              : 'Owner Identity: eepa3142@gmail.com · Secured with Argon/Scrypt Hash'}
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD VIEW ---
  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/95 backdrop-blur-md flex flex-col animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Toast Alert Banner */}
      {actionNotice && (
        <div className="bg-[#D4AF37] text-[#080808] px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg z-50 shrink-0">
          <Check className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-[#080808] border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showSubtitle={false} />
          <div className="hidden sm:block border-l border-white/10 pl-4">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block">
              {t.title}
            </span>
            <span className="text-[11px] text-white/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Owner: eepa3142@gmail.com</span>
              <span className="text-white/30">•</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 rounded-xs">
                {language === 'ar' ? 'سحابة Firestore متصلة' : 'Cloud Firestore Active'}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-rose-950/60 border border-white/10 hover:border-rose-500/40 text-xs text-white/80 hover:text-rose-300 rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logoutButton}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-sm border border-white/10 cursor-pointer"
            aria-label="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#141414] border-r border-white/10 p-4 shrink-0 overflow-y-auto">
          <nav className="space-y-1 text-xs">
            {[
              { key: 'overview', icon: LayoutDashboard, label: t.tabs.overview },
              { key: 'menu', icon: Utensils, label: `${t.tabs.menu} (${dishes.length})` },
              { key: 'orders', icon: ShoppingBag, label: `${t.tabs.orders} (${orders.length})` },
              { key: 'reservations', icon: Calendar, label: `${t.tabs.reservations} (${reservations.length})` },
              { key: 'media', icon: ImageIcon, label: `${t.tabs.media} (${galleryItems.length})` },
              { key: 'availability', icon: CheckCircle2, label: t.tabs.availability },
              { key: 'settings', icon: Settings, label: t.tabs.settings },
              { key: 'analytics', icon: BarChart3, label: t.tabs.analytics },
              { key: 'security', icon: ShieldAlert, label: t.tabs.security },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-start cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#080808] font-bold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Viewport */}
        <main className="flex-grow bg-[#080808] p-6 sm:p-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold text-white">
                  {t.tabs.overview} — Executive Summary
                </h3>
                <span className="text-xs text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-sm">
                  Authoritative Server Database
                </span>
              </div>

              {/* KPI Cards Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 bg-[#141414] border border-white/10 rounded-sm">
                  <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">
                    {t.stats.totalOrders}
                  </span>
                  <span className="font-display text-3xl font-bold text-[#D4AF37] tabular-nums">
                    {orders.length}
                  </span>
                </div>

                <div className="p-5 bg-[#141414] border border-white/10 rounded-sm">
                  <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">
                    {t.stats.totalRevenue}
                  </span>
                  <span className="font-display text-3xl font-bold text-[#D4AF37] tabular-nums">
                    ${totalRevenue.toLocaleString()} <span className="text-xs font-sans text-white/60">USD</span>
                  </span>
                </div>

                <div className="p-5 bg-[#141414] border border-white/10 rounded-sm">
                  <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">
                    {t.stats.activeReservations}
                  </span>
                  <span className="font-display text-3xl font-bold text-emerald-400 tabular-nums">
                    {activeReservationsCount}
                  </span>
                </div>

                <div className="p-5 bg-[#141414] border border-white/10 rounded-sm">
                  <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">
                    {t.stats.dishesCount}
                  </span>
                  <span className="font-display text-3xl font-bold text-white tabular-nums">
                    {dishes.length}
                  </span>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-[#141414] border border-white/10 rounded-sm">
                  <h4 className="font-display text-lg font-bold text-white mb-4">
                    Recent Customer Orders
                  </h4>
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((ord) => (
                      <div key={ord.id} className="p-3 bg-[#080808] border border-white/5 rounded-sm flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-[#D4AF37] font-bold mr-2">#{ord.code}</span>
                          <span className="text-white font-medium">{ord.guestName}</span>
                          <span className="text-white/50 ml-2">(${ord.total} USD)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-sm uppercase text-[10px] font-semibold bg-white/5 text-amber-300">
                          {ord.status}
                        </span>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-xs text-white/40 italic">No orders received yet.</p>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-[#141414] border border-white/10 rounded-sm">
                  <h4 className="font-display text-lg font-bold text-white mb-4">
                    Upcoming VIP Table Bookings
                  </h4>
                  <div className="space-y-3">
                    {reservations.slice(0, 4).map((res) => (
                      <div key={res.id} className="p-3 bg-[#080808] border border-white/5 rounded-sm flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-[#D4AF37] font-bold mr-2">#{res.code}</span>
                          <span className="text-white font-medium">{res.guestName}</span>
                          <span className="text-white/50 ml-2">({res.guests} guests · {res.time})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-sm uppercase text-[10px] font-semibold bg-emerald-950/60 text-emerald-400">
                          {res.status}
                        </span>
                      </div>
                    ))}
                    {reservations.length === 0 && (
                      <p className="text-xs text-white/40 italic">No reservations booked yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {t.tabs.menu}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Add, edit, delete, and control prices, categories, and photos across the public menu.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDish({
                      id: `dish-${Date.now()}`,
                      name: { ar: '', en: '' },
                      category: 'signatures',
                      price: 150,
                      currency: 'USD',
                      image: '/src/assets/images/dish_wagyu_steak_1791697177267.jpg',
                      description: { ar: '', en: '' },
                      ingredients: { ar: ['مكونات طازجة ومختارة'], en: ['Fresh artisanal ingredients'] },
                      chefNotes: { ar: 'تحضير دقيق بحرفية الشيف التنفيذي', en: 'Precision culinary preparation' },
                      sommelierPairing: { ar: 'عصائر عنب فاخرة أو مشروبات النخبة', en: 'Grand Cru or Reserve Elixirs' },
                      origin: { ar: 'مكونات موسمية منتقاة', en: 'Artisanal Selection' },
                      tags: { ar: ['فاخر'], en: ['Signature'] },
                      isAvailable: true,
                    });
                    setIsAddingNewDish(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.menuActions.addNew}</span>
                </button>
              </div>

              {/* Dishes List */}
              <div className="grid grid-cols-1 gap-3">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-4 bg-[#141414] border border-white/10 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={dish.image}
                        alt={dish.name?.[language] || dish.name?.en || 'Dish'}
                        className="w-16 h-16 object-cover rounded-sm shrink-0 border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-bold text-white">
                            {dish.name?.[language] || dish.name?.en || ''}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase font-semibold ${dish.isAvailable ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/80 text-rose-400 border border-rose-500/20'}`}>
                            {dish.isAvailable ? (language === 'ar' ? 'متاح' : 'Available') : (language === 'ar' ? 'نافد' : 'Sold Out')}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-1 max-w-xl">
                          {dish.description?.[language] || dish.description?.en || ''}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                          <span className="capitalize">{dish.category}</span>
                          <span>·</span>
                          <span className="font-display font-bold text-[#D4AF37] tabular-nums">
                            ${dish.price} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleAvailability(dish.id)}
                        className={`px-3 py-1.5 text-xs rounded-sm font-semibold transition-colors cursor-pointer ${
                          dish.isAvailable ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {dish.isAvailable ? (language === 'ar' ? 'تعطيل' : 'Disable') : (language === 'ar' ? 'تفعيل' : 'Enable')}
                      </button>
                      <button
                        onClick={() => {
                          setEditingDish(dish);
                          setIsAddingNewDish(false);
                        }}
                        className="p-2 bg-white/5 hover:bg-white/15 text-white rounded-sm text-xs transition-colors cursor-pointer"
                        title={t.menuActions.edit}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-sm text-xs transition-colors cursor-pointer"
                        title={t.menuActions.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {t.tabs.orders}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Manage kitchen orders, change preparation status, view suite delivery details, and archive records.
                </p>
              </div>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 bg-[#141414] border border-white/10 rounded-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#D4AF37] bg-black/60 px-2 py-1 rounded-sm border border-[#D4AF37]/30">
                          #{ord.code}
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {ord.guestName}
                        </h4>
                        <span className="text-xs font-bold text-[#D4AF37] tabular-nums">
                          ${ord.total} USD
                        </span>
                        <span className="text-[11px] text-white/40">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-xs text-white/70 space-y-1">
                        <p><strong>{language === 'ar' ? 'الأطباق المطلوبة:' : 'Items:'}</strong> {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</p>
                        <p><strong>{language === 'ar' ? 'الهاتف:' : 'Phone:'}</strong> {ord.phone}</p>
                        {ord.address && <p><strong>{language === 'ar' ? 'العنوان / الجناح:' : 'Address:'}</strong> {ord.address}</p>}
                        {ord.notes && <p className="text-amber-200/90 italic">"{ord.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as PlacedOrder['status'])}
                        className="px-3 py-1.5 bg-[#080808] border border-white/20 text-xs text-white rounded-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      >
                        <option value="new">New / جديد</option>
                        <option value="pending">Pending / قيد المراجعة</option>
                        <option value="preparing">Preparing / قيد التحضير</option>
                        <option value="ready">Ready / جاهز للتسليم</option>
                        <option value="completed">Completed / مكتمل</option>
                        <option value="cancelled">Cancelled / ملغي</option>
                      </select>

                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-sm transition-colors cursor-pointer"
                        title="Delete Order Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-xs text-white/40 italic p-6 text-center border border-white/5 rounded-sm">
                    {language === 'ar' ? 'لا توجد طلبات مسجلة حالياً.' : 'No customer orders placed yet.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RESERVATIONS LEDGER */}
          {activeTab === 'reservations' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {t.tabs.reservations}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Confirm VIP dining salon bookings, view guest preferences, and manage seating capacity.
                </p>
              </div>

              <div className="space-y-4">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 bg-[#141414] border border-white/10 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#D4AF37] font-bold bg-black/60 px-2 py-0.5 rounded-sm border border-[#D4AF37]/30">
                          {res.code}
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {res.guestName} ({res.guests} {language === 'ar' ? 'ضيوف' : 'guests'})
                        </h4>
                      </div>
                      <p className="text-white/80">
                        {res.date} at {res.time} — <span className="text-[#D4AF37]">{res.seatingArea}</span>
                      </p>
                      <p className="text-white/60 font-mono">
                        {res.phone} {res.email && `· ${res.email}`}
                      </p>
                      {res.notes && <p className="text-amber-200/90 italic">"{res.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <select
                        value={res.status}
                        onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value as Reservation['status'])}
                        className="px-3 py-1.5 bg-[#080808] border border-white/20 text-xs text-white rounded-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      >
                        <option value="pending">Pending / قيد الانتظار</option>
                        <option value="confirmed">Confirmed / مؤكد</option>
                        <option value="seated">Seated / تم الحضور</option>
                        <option value="cancelled">Cancelled / ملغي</option>
                      </select>

                      <button
                        onClick={() => handleDeleteReservation(res.id)}
                        className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-sm transition-colors cursor-pointer"
                        title="Delete Reservation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {reservations.length === 0 && (
                  <p className="text-xs text-white/40 italic p-6 text-center border border-white/5 rounded-sm">
                    {language === 'ar' ? 'لا توجد حجوزات مسجلة حالياً.' : 'No reservations booked yet.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-display text-2xl font-bold text-white">
                {t.tabs.media}
              </h3>
              <p className="text-xs text-white/60">
                High-resolution culinary photography and video clips displayed on the public gallery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item) => (
                  <div key={item.id} className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden">
                    <img src={item.image} alt={item.title?.[language] || item.title?.en || 'Gallery'} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] block mb-1">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.title?.[language] || item.title?.en || ''}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DISH AVAILABILITY TOGGLES */}
          {activeTab === 'availability' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-display text-2xl font-bold text-white">
                {t.tabs.availability}
              </h3>
              <p className="text-xs text-white/60">
                One-click toggle switches to update menu stock status immediately across customer interfaces.
              </p>

              <div className="space-y-2">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-3 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={dish.image} alt={dish.name?.[language] || dish.name?.en || 'Dish'} className="w-10 h-10 object-cover rounded-sm border border-white/10" />
                      <div>
                        <span className="text-white font-bold block">{dish.name?.[language] || dish.name?.en || ''}</span>
                        <span className="text-[11px] text-white/50">${dish.price} USD · {dish.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAvailability(dish.id)}
                      className={`px-3 py-1.5 rounded-sm font-semibold text-xs transition-colors cursor-pointer ${
                        dish.isAvailable
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-900 hover:bg-rose-800 text-white'
                      }`}
                    >
                      {dish.isAvailable 
                        ? (language === 'ar' ? 'متاح (اضغط للتعطيل)' : 'In Stock (Click to Disable)') 
                        : (language === 'ar' ? 'نافد (اضغط للتفعيل)' : 'Sold Out (Click to Enable)')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RESTAURANT SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl animate-fadeIn">
              <h3 className="font-display text-2xl font-bold text-white">
                {t.tabs.settings}
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-white/70 block mb-1">Headline Subtitle (Arabic)</label>
                  <input
                    type="text"
                    value={settingsDraft.headlineSub.ar}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      headlineSub: { ...settingsDraft.headlineSub, ar: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Headline Subtitle (English)</label>
                  <input
                    type="text"
                    value={settingsDraft.headlineSub.en}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      headlineSub: { ...settingsDraft.headlineSub, en: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Tagline (Arabic)</label>
                  <input
                    type="text"
                    value={settingsDraft.tagline.ar}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      tagline: { ...settingsDraft.tagline, ar: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={settingsDraft.phone}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 block mb-1">Email</label>
                    <input
                      type="email"
                      value={settingsDraft.email}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Delivery Fee (USD)</label>
                  <input
                    type="number"
                    value={settingsDraft.deliveryFee}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, deliveryFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/15 rounded-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Restaurant Settings'}</span>
              </button>
            </form>
          )}

          {/* TAB 8: REAL ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-display text-2xl font-bold text-white">
                {t.tabs.analytics}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#141414] border border-white/10 rounded-sm">
                  <h4 className="font-display text-lg font-bold text-white mb-4">
                    Orders Status Distribution
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-white/80">
                      <span>Completed</span>
                      <span className="font-bold text-emerald-400">{orders.filter((o) => o.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Preparing / In Kitchen</span>
                      <span className="font-bold text-amber-400">{orders.filter((o) => o.status === 'preparing').length}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>New Unconfirmed</span>
                      <span className="font-bold text-blue-400">{orders.filter((o) => o.status === 'new').length}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Cancelled</span>
                      <span className="font-bold text-rose-400">{orders.filter((o) => o.status === 'cancelled').length}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#141414] border border-white/10 rounded-sm">
                  <h4 className="font-display text-lg font-bold text-white mb-4">
                    Reservations Occupancy
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-white/80">
                      <span>Confirmed Covers</span>
                      <span className="font-bold text-[#D4AF37]">{reservations.filter((r) => r.status === 'confirmed').reduce((sum, r) => sum + r.guests, 0)} guests</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Seated Patrons</span>
                      <span className="font-bold text-blue-400">{reservations.filter((r) => r.status === 'seated').reduce((sum, r) => sum + r.guests, 0)} guests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SECURITY & SESSIONS */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl animate-fadeIn">
              <h3 className="font-display text-2xl font-bold text-white">
                {t.tabs.security}
              </h3>
              <div className="p-5 bg-[#141414] border border-white/10 rounded-sm space-y-3 text-xs text-white/80">
                <p><strong>Active Session:</strong> Authenticated Master Owner</p>
                <p><strong>Owner Identity:</strong> eepa3142@gmail.com</p>
                <p><strong>Security Level:</strong> Tier 1 Sovereign Master Key</p>
                <p><strong>Token:</strong> Hardened Server Session (Active Bearer Token)</p>
                <p><strong>Protected Routes:</strong> /api/menu (Write), /api/orders (Read/Write), /api/reservations (Write), /api/settings</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EDIT / ADD DISH MODAL WITH COMPREHENSIVE FIELDS */}
      {editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/50 rounded-sm p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-display text-xl font-bold text-white">
                {isAddingNewDish ? t.menuActions.addNew : `${t.menuActions.edit}: ${editingDish.name?.[language] || editingDish.name?.en || ''}`}
              </h4>
              <button onClick={() => setEditingDish(null)} className="text-white/60 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.nameAr}</label>
                <input
                  type="text"
                  required
                  value={editingDish.name.ar}
                  onChange={(e) => setEditingDish({ ...editingDish, name: { ...editingDish.name, ar: e.target.value } })}
                  className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.nameEn}</label>
                <input
                  type="text"
                  required
                  value={editingDish.name.en}
                  onChange={(e) => setEditingDish({ ...editingDish, name: { ...editingDish.name, en: e.target.value } })}
                  className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.descAr}</label>
                <textarea
                  rows={2}
                  value={editingDish.description.ar}
                  onChange={(e) => setEditingDish({ ...editingDish, description: { ...editingDish.description, ar: e.target.value } })}
                  className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white resize-none"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.descEn}</label>
                <textarea
                  rows={2}
                  value={editingDish.description.en}
                  onChange={(e) => setEditingDish({ ...editingDish, description: { ...editingDish.description, en: e.target.value } })}
                  className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white resize-none"
                />
              </div>
            </div>

            {/* Price, Category & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.price}</label>
                <input
                  type="number"
                  required
                  value={editingDish.price}
                  onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.category}</label>
                <select
                  value={editingDish.category}
                  onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value as MenuCategory })}
                  className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white cursor-pointer"
                >
                  <option value="signatures">Signature Dishes / أطباق التوقيع</option>
                  <option value="steaks">Premium Steaks / شرائح اللحم الفاخرة</option>
                  <option value="pasta">Gourmet Pasta / الباستا الراقية</option>
                  <option value="international">International / المأكولات العالمية</option>
                  <option value="seafood">Seafood / المأكولات البحرية</option>
                  <option value="desserts">Desserts / الحلويات الفاخرة</option>
                  <option value="beverages">Premium Beverages / المشروبات الملكية</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">{t.menuActions.availability}</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isAvailable}
                    onChange={(e) => setEditingDish({ ...editingDish, isAvailable: e.target.checked })}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className={editingDish.isAvailable ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                    {editingDish.isAvailable ? (language === 'ar' ? 'متاح للطلب' : 'Available') : (language === 'ar' ? 'نافد من المخزون' : 'Sold Out')}
                  </span>
                </label>
              </div>
            </div>

            {/* Image URL, File Upload & Preset Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-white/70 font-semibold">{t.menuActions.image}</label>
                <label className="text-xs text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1">
                  <span>{language === 'ar' ? 'رفع صورة من جهازك' : 'Upload from device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="text"
                value={editingDish.image}
                onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
                className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-white font-mono text-[11px]"
              />
              {editingDish.image && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-black/40 border border-white/10 rounded-sm">
                  <img src={editingDish.image} alt="Preview" className="w-12 h-12 object-cover rounded-sm border border-white/20" />
                  <span className="text-[11px] text-white/60">
                    {language === 'ar' ? 'معاينة الصورة (حفظ سحابي دائم)' : 'Image Preview (Cloud Persistent)'}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] text-white/50">{language === 'ar' ? 'صور فاخرة جاهزة:' : 'Presets:'}</span>
                {presetDishPhotos.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setEditingDish({ ...editingDish, image: preset.url })}
                    className="px-2 py-1 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-[10px] text-white/80 rounded-sm transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm cursor-pointer"
              >
                {t.menuActions.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleSaveDish(editingDish)}
                className="px-6 py-2 bg-[#D4AF37] hover:bg-[#F2D98D] text-black font-bold uppercase tracking-wider rounded-sm cursor-pointer shadow-md"
              >
                {t.menuActions.save}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
