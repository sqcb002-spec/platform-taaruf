"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function startNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download"))
        return;
      const next = new URL(anchor.href, window.location.href);
      if (
        next.origin !== window.location.origin ||
        next.href === window.location.href ||
        (next.pathname === window.location.pathname && next.hash)
      )
        return;
      setPending(true);
    }

    function startHistoryNavigation() {
      setPending(true);
    }

    document.addEventListener("click", startNavigation, true);
    window.addEventListener("popstate", startHistoryNavigation);
    return () => {
      document.removeEventListener("click", startNavigation, true);
      window.removeEventListener("popstate", startHistoryNavigation);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const safetyTimer = window.setTimeout(() => setPending(false), 15000);
    return () => window.clearTimeout(safetyTimer);
  }, [pending]);

  return pending ? (
    <div className="route-progress" role="status" aria-live="polite">
      <span className="route-progress-line" />
      <span className="route-progress-note">
        <LoaderCircle className="spin" /> Menyiapkan halaman…
      </span>
    </div>
  ) : null;
}
