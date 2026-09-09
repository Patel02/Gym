"use client";

import { publishCircular } from "@/actions/cms.actions";
import { UploadDropzone } from "@/utils/uploadthing";
import { CheckCircle, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

export function CircularUploadForm() {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUploadComplete = async (files: Array<{ url: string }>) => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setIsSuccess(false);
      setMessage("Enter a document title before uploading.");
      return;
    }

    const uploadedFile = files[0];
    if (!uploadedFile) {
      setIsSuccess(false);
      setMessage("No PDF was returned by the upload service.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await publishCircular(normalizedTitle, uploadedFile.url);
    setIsSuccess(result.success);
    setMessage(result.success ? "Circular published successfully." : result.error ?? "Failed to publish circular.");
    if (result.success) setTitle("");
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="circular-title" className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
          Document Title
        </label>
        <input
          id="circular-title"
          type="text"
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="National Meet 2026 Official Rulebook"
          className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-white transition-colors focus:border-gym-orange focus:outline-none"
        />
      </div>

      <div className="rounded-lg border border-white/10 bg-[#111] p-4">
        <UploadDropzone
          endpoint="circularUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            setIsSuccess(false);
            setMessage(`Upload failed: ${error.message}`);
          }}
          disabled={isSaving}
          className="ut-button:bg-gym-orange ut-button:font-bold ut-button:text-black ut-label:text-gray-400 ut-allowed-content:text-gray-500"
        />
      </div>

      {isSaving && (
        <div className="flex items-center gap-2 text-sm font-bold text-gym-orange">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving to database...
        </div>
      )}

      {message && !isSaving && (
        <div className={`flex items-center gap-2 rounded-lg p-4 text-sm font-bold ${isSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {isSuccess && <CheckCircle className="h-4 w-4" />}
          {message}
        </div>
      )}
    </div>
  );
}

export function CircularUploadHeading() {
  return <FileText className="h-8 w-8 text-gym-orange" />;
}