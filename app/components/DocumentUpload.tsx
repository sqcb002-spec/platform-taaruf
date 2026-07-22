"use client";

import { useState } from "react";
import { FileLock2, LoaderCircle, Upload } from "lucide-react";

export function DocumentUpload({
  kind,
  label,
}: {
  kind: "identity_card" | "identity_selfie" | "profile_photo";
  label: string;
}) {
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState("uploading");
    const body = new FormData();
    body.set("kind", kind);
    body.set("file", file);
    const response = await fetch("/api/documents", { method: "POST", body });
    setState(response.ok ? "done" : "error");
  }
  return (
    <label className={`document-upload ${state}`}>
      <input
        type="file"
        accept="image/jpeg,image/png"
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
            : state === "error"
              ? "Upload gagal. Pastikan JPEG/PNG maksimal 5 MB."
              : "JPEG atau PNG, maksimal 5 MB."}
        </p>
      </div>
    </label>
  );
}
