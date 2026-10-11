import React, { useState } from 'react';
import { CartItem, Language, PlacedOrder, PlacedOrderItem } from '../types';
import { translations } from '../data/translations';
import { X, Trash2, Plus, Minus, CheckCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  language: Language;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onOrderPlaced: (order: PlacedOrder) => void;
  onClearCart: () => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  items,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
  onClearCart,
}) => {
  const t = translations[language].order;

  const [deliveryType, setDeliveryType] = useState<'curated_pickup' | 'vip_suite_delivery'>('curated_pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrder | null>(null);

  if (!isOpen) return null;

  // Calculate items subtotal including individual add-ons
  const subtotal = items.reduce((acc, curr) => {
    const addonsCost = curr.selectedAddons?.reduce((sum, a) => sum + a.price, 0) || 0;
    return acc + (curr.dish.price + addonsCost) * curr.quantity;
  }, 0);

  const deliveryFee = deliveryType === 'vip_suite_delivery' ? 25 : 0;
  const taxAndService = Math.round(subtotal * 0.15);
  const total = subtotal + deliveryFee + taxAndService;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !customerName || !customerPhone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderCode = `NR-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const orderItems: PlacedOrderItem[] = items.map((i) => {
        const addonsCost = i.selectedAddons?.reduce((sum, a) => sum + a.price, 0) || 0;
        return {
          dishId: i.dish.id,
          name: i.dish.name?.[language] || i.dish.name?.en || 'Dish',
          quantity: i.quantity,
          unitPrice: i.dish.price,
          selectedAddons: i.selectedAddons,
          itemTotal: (i.dish.price + addonsCost) * i.quantity,
        };
      });

      const order: PlacedOrder = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        code: orderCode,
        items: orderItems,
        subtotal,
        deliveryFee,
        taxAndService,
        total,
        deliveryType,
        guestName: customerName,
        phone: customerPhone,
        address: deliveryType === 'vip_suite_delivery' ? deliveryAddress : undefined,
        notes: orderNotes || undefined,
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      setConfirmedOrder(order);
      onOrderPlaced(order);
      onClearCart();
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className={`fixed inset-y-0 ${language === 'ar' ? 'left-0' : 'right-0'} max-w-full flex pl-10`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#141414] border-l border-white/10 flex flex-col justify-between shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#080808]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-display text-lg font-bold text-[#F5F1E8]">
                {t.drawerTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#F5F1E8]/60 hover:text-white p-1 cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {confirmedOrder ? (
            /* Order Success View */
            <div className="p-8 flex-grow overflow-y-auto flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] block mb-1">
                  {t.orderCode}
                </span>
                <span className="font-display text-3xl font-bold text-[#F5F1E8] tracking-widest tabular-nums">
                  #{confirmedOrder.code}
                </span>
              </div>
              <h4 className="font-display text-xl font-bold text-[#F5F1E8]">
                {t.orderSuccessTitle}
              </h4>
              <p className="text-xs text-[#F5F1E8]/70 leading-relaxed font-light">
                {t.orderSuccessDesc}
              </p>
              
              <div className="w-full bg-[#080808] p-4 rounded-sm border border-white/10 text-xs text-start space-y-2">
                <div className="flex justify-between text-[#F5F1E8]/80">
                  <span>{language === 'ar' ? 'الاسم:' : 'Recipient:'}</span>
                  <span className="text-white font-medium">{confirmedOrder.guestName}</span>
                </div>
                <div className="flex justify-between text-[#F5F1E8]/80">
                  <span>{language === 'ar' ? 'الإجمالي:' : 'Total Amount:'}</span>
                  <span className="text-[#D4AF37] font-bold tabular-nums">${confirmedOrder.total} USD</span>
                </div>
                <div className="flex justify-between text-[#F5F1E8]/80">
                  <span>{language === 'ar' ? 'حالة الطلب:' : 'Status:'}</span>
                  <span className="text-amber-400 font-semibold">{language === 'ar' ? 'طلب جديد (قيد المراجعة)' : 'New (Under Review)'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full py-3 text-xs uppercase tracking-widest font-semibold bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] rounded-sm transition-all cursor-pointer"
              >
                {language === 'ar' ? 'العودة لتصفح المطعم' : 'Return to Dining'}
              </button>
            </div>
          ) : (
            /* Active Cart Items & Checkout Form */
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-white/20 mx-auto" />
                  <p className="text-sm text-[#F5F1E8]/80 font-medium">{t.emptyCart}</p>
                  <p className="text-xs text-[#F5F1E8]/50 max-w-xs mx-auto font-light">{t.emptyCartSub}</p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const addonsCost = item.selectedAddons?.reduce((sum, a) => sum + a.price, 0) || 0;
                      const itemSubtotal = (item.dish.price + addonsCost) * item.quantity;

                      return (
                        <div
                          key={`${item.dish.id}-${index}`}
                          className="flex gap-4 p-3 bg-[#080808] border border-white/10 rounded-sm"
                        >
                          <img
                            src={item.dish.image}
                            alt={item.dish.name?.[language] || item.dish.name?.en || 'Noir Royale'}
                            className="w-16 h-16 object-cover rounded-sm shrink-0"
                          />
                          <div className="flex-grow flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-semibold text-[#F5F1E8] line-clamp-1">
                                  {item.dish.name?.[language] || item.dish.name?.en || ''}
                                </h4>
                                {item.selectedAddons && item.selectedAddons.length > 0 && (
                                  <div className="text-[10px] text-[#D4AF37] mt-0.5 space-y-0.5">
                                    {item.selectedAddons.map((ad) => {
                                      const label = typeof ad.name === 'object' && ad.name ? ((ad.name as any)[language] || (ad.name as any).en || '') : String(ad.name || '');
                                      return (
                                        <span key={ad.id} className="block">
                                          + {label} (${ad.price})
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => onRemoveItem(index)}
                                className="text-white/40 hover:text-rose-400 p-0.5 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-semibold text-[#D4AF37] tabular-nums">
                                ${itemSubtotal}
                              </span>
                              
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm text-xs">
                                <button
                                  onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                  className="text-white/60 hover:text-white cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-medium text-white tabular-nums px-1">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                  className="text-white/60 hover:text-white cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Selection */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold block">
                      {t.deliveryMethod}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('curated_pickup')}
                        className={`p-2.5 rounded-sm border text-start transition-all cursor-pointer ${
                          deliveryType === 'curated_pickup'
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-medium'
                            : 'bg-[#080808] border-white/10 text-white/60'
                        }`}
                      >
                        {t.curatedPickup} ($0)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('vip_suite_delivery')}
                        className={`p-2.5 rounded-sm border text-start transition-all cursor-pointer ${
                          deliveryType === 'vip_suite_delivery'
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-medium'
                            : 'bg-[#080808] border-white/10 text-white/60'
                        }`}
                      >
                        {t.suiteDelivery} ($25)
                      </button>
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <form onSubmit={handleCheckout} id="order-form" className="space-y-3 text-xs">
                    <div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={t.customerName}
                        className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-[#F5F1E8] placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={t.customerPhone}
                        className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-[#F5F1E8] placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    {deliveryType === 'vip_suite_delivery' && (
                      <div>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder={t.deliveryAddress}
                          className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 rounded-sm text-[#F5F1E8] placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    )}
                    <div>
                      <textarea
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder={t.orderNotes}
                        className="w-full px-3 py-2 bg-[#080808] border border-white/15 rounded-sm text-[#F5F1E8] placeholder-white/40 focus:outline-none focus:border-[#D4AF37] resize-none"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Footer Checkout Summary */}
          {!confirmedOrder && items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#080808] space-y-3">
              <div className="space-y-1.5 text-xs text-[#F5F1E8]/70">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="text-white tabular-nums">${subtotal}</span>
                </div>
                {deliveryType === 'vip_suite_delivery' && (
                  <div className="flex justify-between">
                    <span>{t.deliveryFee}</span>
                    <span className="text-white tabular-nums">${deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.taxAndService}</span>
                  <span className="text-white tabular-nums">${taxAndService}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                  <span>{t.total}</span>
                  <span className="text-[#D4AF37] text-base tabular-nums">${total} USD</span>
                </div>
              </div>

              <button
                type="submit"
                form="order-form"
                disabled={isSubmitting}
                className="w-full py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#080808] bg-[#D4AF37] hover:bg-[#F2D98D] rounded-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? t.submitting : t.confirmOrder}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
