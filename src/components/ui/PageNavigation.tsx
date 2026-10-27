"use client";

import Link from "next/link";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageNavigationProps {
  href?: string;
  label?: string;
  backHref?: string;
  backLabel?: string;
  parentLabel?: string;
  parentHref?: string;
  currentPage?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  showBackArrow?: boolean;
  className?: string;
}

export function PageNavigation({
  href,
  label,
  backHref,
  backLabel,
  parentLabel,
  parentHref,
  currentPage,
  breadcrumbs,
  badge,
  showBackArrow = false,
  className = "mb-6",
}: PageNavigationProps) {
  const targetHref = backHref || href || "/";
  const targetLabel = backLabel || label || "Go Back";

  // Build breadcrumb items list
  let items: BreadcrumbItem[] = [];

  if (breadcrumbs && breadcrumbs.length > 0) {
    items = breadcrumbs.map((crumb, idx) => {
      // Normalize first item to Home if it says "Public Hub" or "Home"
      if (idx === 0 && (crumb.label.toLowerCase() === "public hub" || crumb.label.toLowerCase() === "home")) {
        return { label: "Home", href: "/" };
      }
      return crumb;
    });

    // Ensure Home is the first crumb
    if (items[0]?.href !== "/") {
      items.unshift({ label: "Home", href: "/" });
    }
  } else {
    // If no breadcrumbs array is passed, auto-generate standard breadcrumbs
    items.push({ label: "Home", href: "/" });

    if (parentLabel && parentHref) {
      items.push({ label: parentLabel, href: parentHref });
    }

    const leafLabel =
      currentPage ||
      (badge ? badge : undefined) ||
      (backLabel && !/^back to home$/i.test(backLabel) ? backLabel.replace(/^back to\s+/i, "") : undefined) ||
      (label && !/^back to home$/i.test(label) ? label.replace(/^back to\s+/i, "") : undefined);

    if (leafLabel && leafLabel.toLowerCase() !== "home") {
      items.push({ label: leafLabel });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      className={`relative z-20 flex flex-wrap items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 font-semibold text-zinc-400">
        {/* Optional subtle back arrow button */}
        {showBackArrow && targetHref && (
          <Link
            href={targetHref}
            prefetch={true}
            title={targetLabel}
            className="group mr-1 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-zinc-400 hover:border-gym-primary/50 hover:bg-white/[0.08] hover:text-gym-primary transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </Link>
        )}

        {/* Breadcrumb Hierarchy */}
        {items.map((crumb, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          if (isLast) {
            return (
              <span
                key={index}
                className="text-gym-primary uppercase tracking-wider font-bold truncate max-w-[280px] sm:max-w-md"
              >
                {crumb.label}
              </span>
            );
          }

          return (
            <div key={index} className="flex items-center gap-2">
              <Link
                href={crumb.href || "/"}
                prefetch={true}
                className="hover:text-gym-primary transition-colors flex items-center gap-1 text-zinc-400 font-semibold"
              >
                {isFirst && <Home className="h-3.5 w-3.5" />}
                <span>{crumb.label}</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Optional Badge Indicator on right */}
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gym-primary shadow-[0_0_15px_rgba(230,80,27,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-gym-primary animate-pulse" />
          {badge}
        </span>
      )}
    </nav>
  );
}

export default PageNavigation;
