"use client";

import React, { useState, useMemo } from "react";
import { CartItem } from "@/data/shop-products";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [isMember, setIsMember] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>("Patel Rakesh");
  const [customerPhone, setCustomerPhone] = useState<string>("9876543210");
  const [customerAddress, setCustomerAddress] = useState<string>("B-402, Shivam Heights, Ahmedabad, Gujarat");

  // Subtotal Calculation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.priceInr * item.quantity, 0);
  }, [cart]);

  // 10% Federation Member Discount
  const memberDiscount = isMember ? Math.round(subtotal * 0.1) : 0;
  const deliveryFee = subtotal >= 2999 || subtotal === 0 ? 0 : 199;
  const grandTotal = subtotal - memberDiscount + deliveryFee;

  // Free shipping progress (₹2,999 threshold)
  const freeShippingThreshold = 2999;
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

  // Pre-composed WhatsApp Order Dispatch Message
  const whatsappOrderMessage = useMemo(() => {
    let msg = `🛍️ *OFFICIAL FEDERATION PRO-SHOP ORDER*\n\n`;
    msg += `🏋️ Customer: *${customerName}*\n`;
    msg += `📞 Contact: *${customerPhone}*\n`;
    msg += `📍 Delivery Address: *${customerAddress}*\n`;
    msg += `🏷️ Member Discount: *${isMember ? "Applied (-10%)" : "No"}*\n\n`;
    msg += `📦 *ORDERED ITEMS:*\n`;

    cart.forEach((item, idx) => {
      const itemTotal = item.product.priceInr * item.quantity;
      msg += `${idx + 1}. *${item.product.name}*\n`;
      msg += `   • Size/Fit: *${item.selectedSize}*\n`;
      msg += `   • Qty: *${item.quantity}* × ₹${item.product.priceInr} = *₹${itemTotal}*\n`;
      if (item.product.ipfApproved) {
        msg += `   • Status: ✅ *IPF Approved*\n`;
      }
    });

    msg += `\n─────────────────────\n`;
    msg += `💵 Subtotal: *₹${subtotal.toLocaleString("en-IN")}*\n`;
    if (memberDiscount > 0) {
      msg += `🎁 Member 10% Discount: *-₹${memberDiscount.toLocaleString("en-IN")}*\n`;
    }
    msg += `🚚 Shipping: *${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}*\n`;
    msg += `💰 *FINAL AMOUNT PAYABLE: ₹${grandTotal.toLocaleString("en-IN")}*\n`;
    msg += `─────────────────────\n`;
    msg += `Please send UPI / Payment QR code to confirm dispatch. Thank you!`;

    return encodeURIComponent(msg);
  }, [cart, customerName, customerPhone, customerAddress, isMember, subtotal, memberDiscount, deliveryFee, grandTotal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between bg-zinc-950 border-l border-white/10 shadow-2xl p-6 overflow-y-auto">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gym-primary" />
              <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                Equipment Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="my-4 rounded-xl border border-white/10 bg-black/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <Truck className="h-3.5 w-3.5 text-gym-primary" />
                {freeShippingRemaining === 0 ? (
                  <span className="text-emerald-400 font-black">Free Pan-India Delivery Unlocked!</span>
                ) : (
                  <span>Add ₹{freeShippingRemaining.toLocaleString("en-IN")} more for Free Delivery</span>
                )}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">
                Goal: ₹{freeShippingThreshold}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gym-primary to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-5xl">🛍️</div>
              <p className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                Your Equipment Bag is Empty
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Explore IPF-approved singlets, lever belts, knee sleeves, and nutrition packs in the pro-shop.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 my-4 max-h-[38vh] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-2xl">
                      {item.product.imageEmoji}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                          {item.selectedSize}
                        </span>
                        <span className="text-xs font-black text-gym-primary">
                          ₹{(item.product.priceInr * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                      className="h-6 w-6 rounded bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-black text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                      className="h-6 w-6 rounded bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                      className="h-6 w-6 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 ml-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Checkout Section */}
        {cart.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Federation Member Discount Toggle */}
            <div
              onClick={() => setIsMember(!isMember)}
              className="flex items-center justify-between rounded-xl border border-gym-primary/30 bg-gym-primary/10 p-2.5 cursor-pointer hover:bg-gym-primary/15 transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gym-primary" />
                <span className="text-xs font-bold text-white">
                  Active Federation Member (10% Off)
                </span>
              </div>
              <input
                type="checkbox"
                checked={isMember}
                onChange={() => {}}
                className="accent-gym-primary h-4 w-4 cursor-pointer"
              />
            </div>

            {/* Price Ledger */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Cart Subtotal:</span>
                <span className="text-white font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {memberDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Member Benefit (-10%):</span>
                  <span className="font-mono">-₹{memberDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-zinc-400">
                <span>Pan-India Delivery:</span>
                <span className="text-white font-mono">
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm font-black text-white">
                <span className="uppercase">Grand Total:</span>
                <span className="text-gym-primary font-heading text-lg">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Quick Customer Inputs */}
            <div className="space-y-2 rounded-xl bg-black/50 border border-white/10 p-3 text-xs">
              <span className="text-[10px] font-semibold uppercase text-zinc-400 block">
                Direct Dispatch Details
              </span>
              <input
                type="text"
                placeholder="Athlete Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-gym-primary"
              />
              <input
                type="text"
                placeholder="Shipping City, State"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-gym-primary"
              />
            </div>

            {/* 1-Click WhatsApp Direct Order Button */}
            <a
              href={`https://wa.me/917043951377?text=${whatsappOrderMessage}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-4 w-4" />
              <span>Instant Order via WhatsApp</span>
            </a>

            <p className="text-[10px] text-zinc-500 text-center">
              Direct checkout verified with Coach Akash &amp; Tanvi. Official invoice &amp; tracking provided.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
