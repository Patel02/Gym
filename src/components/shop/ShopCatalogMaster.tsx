"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SHOP_PRODUCTS,
  ShopProduct,
  ProductCategory,
  CartItem,
} from "@/data/shop-products";
import { ProductCard } from "./ProductCard";
import { CartDrawer } from "./CartDrawer";
import { ProductDetailModal } from "./ProductDetailModal";
import { SizingGuideModal } from "./SizingGuideModal";
import {
  ShoppingBag,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2,
  Ruler,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

export function ShopCatalogMaster() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"FEATURED" | "PRICE_ASC" | "PRICE_DESC">("FEATURED");
  const [onlyIpfApproved, setOnlyIpfApproved] = useState<boolean>(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(null);
  const [isSizingGuideOpen, setIsSizingGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("federation_pro_shop_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse cart:", e);
    }
  }, []);

  // Save cart changes
  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("federation_pro_shop_cart", JSON.stringify(newCart));
    } catch (e) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart operations
  const handleAddToCart = (product: ShopProduct, size: string) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [...cart, { product, selectedSize: size, quantity: 1 }];
    }

    updateCartState(updatedCart);
    showToast(`Added ${product.name} (${size}) to Bag!`);
  };

  const handleUpdateQuantity = (productId: string, size: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.product.id === productId && item.selectedSize === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    updateCartState(updatedCart);
  };

  const handleRemoveItem = (productId: string, size: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.selectedSize === size)
    );
    updateCartState(updatedCart);
    showToast("Item removed from equipment bag.");
  };

  const handleClearCart = () => {
    updateCartState([]);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return SHOP_PRODUCTS.filter((product) => {
      // Category filter
      if (activeCategory !== "ALL" && product.category !== activeCategory) {
        return false;
      }
      // IPF filter
      if (onlyIpfApproved && !product.ipfApproved) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.shortDescription.toLowerCase().includes(query);
        const matchTag = product.tag?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchTag) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.priceInr - b.priceInr;
      if (sortBy === "PRICE_DESC") return b.priceInr - a.priceInr;
      return 0; // Featured
    });
  }, [activeCategory, onlyIpfApproved, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-8">
      {/* ── TOP HERO HEADER (Dark Luxury Olympic Aesthetics) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180803] via-[#0e0301] to-[#120402] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>OFFICIAL FEDERATION GEAR &amp; PRO-SHOP</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white">
              Official Federation <span className="text-gym-primary">Pro-Shop</span>
            </h1>

            <p className="text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed">
              IPF platform-approved competition singlets, 13mm quick-release lever belts, 7mm conical knee sleeves, and certified meet day rapid refeed bundles.
            </p>
          </div>

          {/* Quick Header Actions: Sizing Guide & Bag Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSizingGuideOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Ruler className="h-4 w-4 text-gym-primary" />
              <span>Sizing Guide</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-orange-950/40 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Equipment Bag</span>
              {totalCartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-black">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-bold">100% IPF Platform Legal</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Truck className="h-4 w-4 text-gym-primary shrink-0" />
            <span className="font-bold">Free Delivery on Orders &gt; ₹2,999</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="font-bold">10% Off for Federation Members</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="font-bold">24/7 Coach WhatsApp Support</span>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "All Equipment" },
              { id: "BELTS_SLEEVES", label: "🥋 Belts & Sleeves" },
              { id: "COMPETITION_APPAREL", label: "🩱 Singlets & Apparel" },
              { id: "REFEED_NUTRITION", label: "🧪 Nutrition & Refeed" },
              { id: "TECHNICAL_ACCESSORIES", label: "📋 Technical Gear" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-gym-primary text-white shadow-md shadow-orange-950"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input & IPF Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search products, gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-gym-primary"
              />
            </div>

            {/* IPF Only Checkbox */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 text-xs font-bold text-zinc-300 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={onlyIpfApproved}
                onChange={(e) => setOnlyIpfApproved(e.target.checked)}
                className="accent-gym-primary h-3.5 w-3.5"
              />
              <span>IPF Legal Only</span>
            </label>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 focus:outline-none focus:border-gym-primary cursor-pointer"
            >
              <option value="FEATURED">Featured First</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border border-white/10 bg-zinc-950">
          <div className="text-5xl">🔍</div>
          <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
            No Products Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing your category filters to view available equipment.
          </p>
          <button
            onClick={() => {
              setActiveCategory("ALL");
              setSearchQuery("");
              setOnlyIpfApproved(false);
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      )}

      {/* ── MODALS & DRAWERS ── */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenSizingGuide={() => {
          setQuickViewProduct(null);
          setIsSizingGuideOpen(true);
        }}
      />

      <SizingGuideModal
        isOpen={isSizingGuideOpen}
        onClose={() => setIsSizingGuideOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-500/40 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fadeIn">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-white">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
