"use client";

import React from "react";

interface WhatsAppIconProps {
  className?: string;
  /**
   * - "official": Authentic WhatsApp green bubble with white phone handset
   * - "white": Pure white silhouette with bubble & phone handset
   * - "currentColor": Uses parent text color
   * - "badge": White circular 3D badge with official green WhatsApp logo inside (optimized for CTA buttons)
   * - "green": Pure WhatsApp green silhouette (#25D366)
   */
  variant?: "official" | "white" | "currentColor" | "badge" | "green";
}

/**
 * High-definition, authentic WhatsApp SVG paths:
 * - Bubble: Official speech bubble contour with tail
 * - Handset: Iconic angled telephone receiver
 */
export default function WhatsAppIcon({
  className = "h-5 w-5",
  variant = "official",
}: WhatsAppIconProps) {
  if (variant === "badge") {
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-white text-[#25D366] shadow-[0_2px_8px_rgba(0,0,0,0.25)] ring-2 ring-white/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[65%] w-[65%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Authentic WhatsApp Green Speech Bubble */}
          <path
            fill="#25D366"
            d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"
          />
          {/* White Telephone Handset */}
          <path
            fill="#FFFFFF"
            d="M17.47 14.38c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7 1.89-.86 1.07-.16.18-.32.21-.59.07-.27-.14-1.16-.43-2.22-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.04-.34-.02-.48-.07-.14-.61-1.48-.84-2.02-.22-.54-.45-.46-.61-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.99 2.67 1.13 2.86.14.18 1.94 2.97 4.71 4.16.66.28 1.17.45 1.57.58.66.21 1.27.18 1.75.11.53-.08 1.61-.66 1.84-1.29.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.52-.32z"
          />
        </svg>
      </span>
    );
  }

  if (variant === "official") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#29E370" />
            <stop offset="100%" stopColor="#20BA59" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waGradient)"
          d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"
        />
        <path
          fill="#FFFFFF"
          d="M17.47 14.38c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7 1.89-.86 1.07-.16.18-.32.21-.59.07-.27-.14-1.16-.43-2.22-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.04-.34-.02-.48-.07-.14-.61-1.48-.84-2.02-.22-.54-.45-.46-.61-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.99 2.67 1.13 2.86.14.18 1.94 2.97 4.71 4.16.66.28 1.17.45 1.57.58.66.21 1.27.18 1.75.11.53-.08 1.61-.66 1.84-1.29.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.52-.32z"
        />
      </svg>
    );
  }

  const fill =
    variant === "white"
      ? "#FFFFFF"
      : variant === "green"
      ? "#25D366"
      : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 10.24c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.3" />
    </svg>
  );
}
