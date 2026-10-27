"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileImageUpload({ currentImage }: { currentImage?: string | null }) {
  const [imageUrl, setImageUrl] = useState(currentImage || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpdate = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (res.ok) {
        setImageUrl(url);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update profile image", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 bg-[#111] border border-white/10 p-6 rounded-xl">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/20 flex items-center justify-center shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8 text-gray-500" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Avatar</span>
        <UploadButton<OurFileRouter, "profileImageUploader">
          endpoint="profileImageUploader"
          onClientUploadComplete={(res) => {
            if (res && res[0].url) {
              handleImageUpdate(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`Upload error: ${error.message}`);
          }}
          className="ut-button:bg-gym-primary ut-button:text-black ut-button:font-bold ut-button:text-xs ut-button:px-4 ut-button:py-2 ut-allowed-content:hidden"
        />
        {loading && <span className="text-xs text-gym-primary flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Updating profile...</span>}
      </div>
    </div>
  );
}
