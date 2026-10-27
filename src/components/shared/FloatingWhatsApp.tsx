"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Send, CheckCheck, Sparkles } from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export function WhatsAppLogo({ className = "h-7 w-7" }: { className?: string }) {
  return <WhatsAppIcon variant="white" className={className} />;
}

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "917043951377";
  const defaultText = "Hi Coaches Akash & Tanvi, I want to consult regarding A&T Fitness & Nutrition coaching!";

  const quickPrompts = [
    { label: "⚡ Starter Plan (₹699/mo)", text: "Hi Akash & Tanvi, I want to know details about the ₹699 Starter Plan." },
    { label: "🏋️ Powerlifting Coaching", text: "Hi Coaches, I am interested in Powerlifting Coaching & strength programming." },
    { label: "🥗 PCOS / Nutrition Support", text: "Hi Tanvi & Akash, I would like to consult about PCOS / Thyroid nutrition support." },
  ];

  // Hide WhatsApp floating bubble on fullscreen broadcast displays (evaluated after all hooks)
  if (
    pathname?.startsWith('/live/jumbotron') ||
    pathname?.startsWith('/live/overlay') ||
    pathname?.startsWith('/live/warmup')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-5 sm:right-6 z-50 flex flex-col items-end">
      
      {/* ── Expandable WhatsApp Chat Popover Card ── */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-84 rounded-3xl overflow-hidden border border-emerald-500/30 bg-[#0d1612] shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* WhatsApp Header Bar */}
          <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] px-4 py-3.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/40 bg-black shrink-0">
                <Image
                  src="/images/at-logo.png"
                  alt="A&T Fitness Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#075E54]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-heading text-sm font-bold tracking-wide leading-none">
                  <span>A&T FITNESS & NUTRITION</span>
                </div>
                <span className="text-[10px] text-emerald-100/90 font-medium mt-1">
                  Coaches Akash & Tanvi • Online
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 flex flex-col gap-3 text-xs bg-[radial-gradient(#15261d_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Incoming Message Bubble */}
            <div className="self-start max-w-[90%] rounded-2xl rounded-tl-sm bg-[#1b2d24] border border-emerald-500/20 p-3.5 text-gray-200 shadow-md">
              <p className="font-semibold text-white mb-1 flex items-center gap-1 text-[11px] text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Coach Akash & Tanvi
              </p>
              <p className="leading-relaxed">
                Namaste! 👋 Ready to transform your physique? Ask us anything about our ₹699 Starter plan, personalized diets, or competitive powerlifting!
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-gray-400">
                <span>Just now</span>
                <CheckCheck className="h-3 w-3 text-emerald-400" />
              </div>
            </div>

            {/* Quick Consultation Trigger Chips */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 px-1">
                Quick Enquiry:
              </span>
              {quickPrompts.map((prompt) => (
                <a
                  key={prompt.label}
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(prompt.text)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs font-medium text-gray-300 hover:bg-emerald-600/20 hover:border-emerald-500/50 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span>{prompt.label}</span>
                  <Send className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            {/* Main CTA Button */}
            <a
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultText)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppLogo className="h-4 w-4 fill-white" />
              <span>Start WhatsApp Chat Now</span>
            </a>
          </div>
        </div>
      )}

      {/* ── Main Trigger Button with Authentic WhatsApp Branding ── */}
      <div className="flex items-center gap-3">
        
        {/* Hover / Status Bubble */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0c1a14]/95 px-4 py-2 text-xs font-bold text-white shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-emerald-400 hover:bg-[#11241c] transition-all cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Chat on WhatsApp</span>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/40">
              Online
            </span>
          </button>
        )}

        {/* The Floating WhatsApp Button */}
        <div className="relative group">
          {/* Animated Glow Rings */}
          <span className="absolute -inset-2 animate-ping rounded-full bg-[#25D366]/20 duration-1000 pointer-events-none" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] opacity-70 blur-md group-hover:opacity-100 transition-opacity pointer-events-none" />

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle WhatsApp Chat"
            className="relative flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.55)] transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white stroke-[2.5]" />
            ) : (
              <WhatsAppLogo className="h-8 w-8 text-white fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-105" />
            )}

            {/* Notification Badge */}
            {!isOpen && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-gym-black text-[10px] font-semibold text-white shadow-md">
                1
              </span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
