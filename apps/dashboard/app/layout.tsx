import type { Metadata } from "next";
import { Suspense } from "react";
import { RouteProgress } from "@/app/components/RouteProgress";
import "./styles.css";
import "./auth.css";
import "./dashboard/dashboard.css";
export const metadata: Metadata = { title: "Platform Ta'aruf Sunnah", description: "Proses ta'aruf yang terarah, aman, dan menjaga adab." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
