import type { Metadata } from "next";
import { Inter, Outfit, Bebas_Neue } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/ui/Footer";
import FloatingWhatsApp from "@/components/shared/FloatingWhatsApp";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WPI Association of Gujarat | Official Powerlifting Federation & Academy",
  description:
    "Official World Powerlifting India (WPI) Association of Gujarat portal. Sanctioned championships, state records, referee switchboard, coaching academy, and anti-doping administration.",
  keywords: [
    "WPI Gujarat",
    "WPI Association of Gujarat",
    "World Powerlifting India",
    "Gujarat powerlifting",
    "powerlifting federation",
    "A&T Fitness",
    "online coaching",
    "Akash Tanvi fitness",
  ],
  openGraph: {
    title: "WPI Association of Gujarat | World Powerlifting India",
    description:
      "Official Gujarat State Governing Body for Powerlifting. Championships, rankings, certified coaching, and platform refereeing.",
    type: "website",
  },
  // ── PWA Metadata ──
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WPI Referee",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#FF5500",
    "theme-color": "#FF5500",
  },
};


import { auth } from "@/auth";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${outfit.variable} ${bebasNeue.variable} scroll-smooth`}
    >
      <head>
        {/* PWA manifest & theme */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF5500" />
        <link rel="apple-touch-icon" href="/wpi-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WPI Referee" />
      </head>
      <body
        className="flex min-h-screen flex-col bg-gym-black text-gym-white"
        suppressHydrationWarning
      >
        <Navbar session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />

        {/* ── Service Worker Registration (afterInteractive = non-blocking) ── */}
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for (var r of regs) { r.unregister(); }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (var n of names) { caches.delete(n); }
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                      .then(function(reg) {
                        console.log('[PWA] SW registered:', reg.scope);
                        setInterval(function() { reg.update(); }, 60000);
                        reg.addEventListener('updatefound', function() {
                          var newWorker = reg.installing;
                          if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                              }
                            });
                          }
                        });
                      })
                      .catch(function(err) {
                        console.warn('[PWA] SW registration failed:', err);
                      });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
