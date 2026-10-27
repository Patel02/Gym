import { ShopCatalogMaster } from "@/components/shop/ShopCatalogMaster";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Official IPF Powerlifting Pro-Shop & Equipment Store | A&T Powerlifting",
  description:
    "Official Indian Powerlifting Federation competition singlets, 13mm quick-release lever belts, 7mm conical knee sleeves, and meet day rapid refeed nutrition bundles. Verified IPF platform legal.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#080201] text-white pt-28 sm:pt-32 lg:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <Link href="/" className="hover:text-gym-primary transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
          <Link href="/equipment" className="hover:text-gym-primary transition-colors">
            Equipment
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-gym-primary uppercase tracking-wider font-bold">
            Official Pro-Shop
          </span>
        </nav>

        {/* Master Catalog Application */}
        <ShopCatalogMaster />
      </div>
    </div>
  );
}
