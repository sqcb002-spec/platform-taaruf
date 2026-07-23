"use client";

import { useState } from "react";
import { FileLock2, LoaderCircle, Upload } from "lucide-react";
import { apiUrl } from "@/lib/api-client";

export function DocumentUpload({
  kind,
  label,
  maxSizeMb = 5,
  allowWebp = false,
}: {
  kind: "identity_card" | "identity_selfie" | "profile_photo";
  label: string;
  maxSizeMb?: number;
  allowWebp?: boolean;
}) {
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setState("error");
      return;
    }
    setState("uploading");
    const body = new FormData();
    body.set("kind", kind);
    body.set("file", file);
    try {
      const response = await fetch(`${apiUrl}/api/documents`, { method: "POST", body, credentials: "include" });
      setState(response.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }
  return (
    <label
      className={`document-upload ${state}`}
      aria-busy={state === "uploading"}
    >
      <input
        type="file"
        accept={allowWebp ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png"}
        aria-label={`${label}. Pilih file JPEG, PNG${allowWebp ? ", atau WebP" : ""} maksimal ${maxSizeMb} MB`}
        onChange={upload}
        disabled={state === "uploading"}
      />
      <span>
        {state === "uploading" ? (
          <LoaderCircle className="spin" />
        ) : state === "done" ? (
          <FileLock2 />
        ) : (
          <Upload />
        )}
      </span>
      <div>
        <strong>{label}</strong>
        <p>
          {state === "done"
            ? "Terenkripsi dan masuk antrean pemeriksaan."
            : state === "uploading"
              ? "Mengunggah, mengenkripsi, dan menyimpan dengan aman…"
            : state === "error"
              ? "Upload gagal. Pastikan JPEG/PNG maksimal 5 MB."
            : `${allowWebp ? "JPG, PNG, atau WebP" : "JPEG atau PNG"}, maksimal ${maxSizeMb} MB.`}
        </p>
      </div>
    </label>
  );
}
