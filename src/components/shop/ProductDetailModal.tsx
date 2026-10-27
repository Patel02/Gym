"use client";

import React, { useState } from "react";
import { ShopProduct } from "@/data/shop-products";
import {
  X,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Check,
  Info,
  Ruler,
  Dumbbell,
} from "lucide-react";

interface ProductDetailModalProps {
  product: ShopProduct | null;
  onClose: () => void;
  onAddToCart: (product: ShopProduct, size: string) => void;
  onOpenSizingGuide: () => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onOpenSizingGuide,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  if (!product) return null;

  const currentSize = selectedSize || product.availableSizes[0] || "Standard";

  const handleAdd = () => {
    onAddToCart(product, currentSize);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-950 p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl bg-white/5 border border-white/10 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Visual Badge Container */}
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-black/80 border border-white/10 text-7xl select-none">
            {product.imageEmoji}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {product.categoryLabel}
              </span>
              {product.ipfApproved && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>IPF PLATFORM LEGAL</span>
                </span>
              )}
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3">
              <span className="font-heading text-2xl font-bold text-gym-primary">
                ₹{product.priceInr.toLocaleString("en-IN")}
              </span>
              {product.originalPriceInr > product.priceInr && (
                <span className="text-xs text-zinc-500 line-through">
                  ₹{product.originalPriceInr.toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-[11px] text-zinc-400 font-bold">
                (Includes GST &amp; Federation Ratification)
              </span>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="my-6 space-y-2 border-t border-white/10 pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Technical Engineering &amp; Platform Utility
          </h4>
          <p className="text-xs font-medium text-zinc-300 leading-relaxed">
            {product.fullDescription}
          </p>
        </div>

        {/* Specifications Ledger */}
        <div className="my-6 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Technical Specifications &amp; Tolerances
          </h4>
          <div className="rounded-xl border border-white/10 bg-black/60 divide-y divide-zinc-800 text-xs">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3">
                <span className="text-zinc-400 font-bold">{key}</span>
                <span className="text-white font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Size Selection Row */}
        {product.availableSizes.length > 1 && (
          <div className="my-6 space-y-2 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Select Your Size
              </span>
              <button
                type="button"
                onClick={onOpenSizingGuide}
                className="text-xs text-gym-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Ruler className="h-3.5 w-3.5" />
                <span>Open Sizing Guide</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {product.availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentSize === s
                      ? "bg-gym-primary text-white font-black shadow-md shadow-orange-950"
                      : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Bag Action */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleAdd}
            className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-gym-primary to-gym-red text-white hover:brightness-110 shadow-orange-950"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="h-4 w-4" />
                <span>Added to Equipment Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Equipment Bag (₹{product.priceInr.toLocaleString("en-IN")})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
