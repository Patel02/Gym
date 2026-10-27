import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OBS Livestream Lower-Third Overlay | Indian Powerlifting Federation",
  description:
    "Broadcast-grade real-time lower-third overlay and referee HUD for OBS Studio and vMix with transparent background.",
};

export default function StreamOverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        :root, html, body, main {
          background: transparent !important;
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent select-none pointer-events-none">
        {children}
      </div>
    </>
  );
}
