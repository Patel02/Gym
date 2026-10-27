"use client";

import React, { useState } from "react";
import { ShopProduct } from "@/data/shop-products";
import {
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Eye,
  Check,
  Tag,
  Dumbbell,
} from "lucide-react";

interface ProductCardProps {
  product: ShopProduct;
  onAddToCart: (product: ShopProduct, size: string) => void;
  onQuickView: (product: ShopProduct) => void;
}

export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.availableSizes[0] || "Standard");
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const discountPercent = Math.round(
    ((product.originalPriceInr - product.priceInr) / product.originalPriceInr) * 100
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-5 flex flex-col justify-between transition-all duration-300 hover:border-gym-primary/50 hover:shadow-xl hover:shadow-orange-950/20">
      {/* ── TOP BADGES ── */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {product.ipfApproved ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>IPF APPROVED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              <Dumbbell className="h-3 w-3" />
              <span>TRAINING ESSENTIAL</span>
            </span>
          )}

          {discountPercent > 0 && (
            <span className="inline-flex items-center rounded-md bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-400">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {/* Product Visual Container */}
        <div className="relative my-4 flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-b from-white/5 to-black/60 border border-white/5 group-hover:border-gym-primary/20 transition-all">
          <div className="text-6xl select-none transform transition-transform duration-300 group-hover:scale-110">
            {product.imageEmoji}
          </div>

          {product.tag && (
            <div className="absolute bottom-2 left-2 rounded-md bg-black/80 border border-white/15 px-2 py-0.5 text-[9px] font-bold text-gym-primary uppercase tracking-wider backdrop-blur-sm">
              {product.tag}
            </div>
          )}

          {/* Quick View Button overlay */}
          <button
            onClick={() => onQuickView(product)}
            className="absolute top-2 right-2 rounded-lg bg-black/70 border border-white/10 p-1.5 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
            title="Quick View Specs"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Title & Category */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {product.categoryLabel}
          </span>
          <h3 className="font-heading text-base font-bold uppercase tracking-wide text-white group-hover:text-gym-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>
      </div>

      {/* ── BOTTOM SECTION: SIZES, PRICE & ADD TO BAG ── */}
      <div className="mt-5 space-y-3 pt-3 border-t border-white/10">
        {/* Size Selection (if multiple sizes) */}
        {product.availableSizes.length > 1 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">
              Size / Fit:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {product.availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    selectedSize === s
                      ? "bg-gym-primary text-white font-black"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Row */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-xl font-bold text-white">
              ₹{product.priceInr.toLocaleString("en-IN")}
            </span>
            {product.originalPriceInr > product.priceInr && (
              <span className="text-xs text-zinc-500 line-through">
                ₹{product.originalPriceInr.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 font-bold">
            Incl. all taxes
          </span>
        </div>

        {/* Add to Bag Action */}
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            addedAnimation
              ? "bg-emerald-600 text-white shadow-emerald-950"
              : "bg-gradient-to-r from-gym-primary to-gym-red text-white hover:brightness-110 shadow-orange-950/40"
          }`}
        >
          {addedAnimation ? (
            <>
              <Check className="h-4 w-4" />
              <span>Added to Bag!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
