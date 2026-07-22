"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function PendingSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="app-primary" disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <LoaderCircle className="spin" /> Menyimpan dengan aman…
        </>
      ) : (
        <>
          Simpan bagian <ArrowRight />
        </>
      )}
    </button>
  );
}
