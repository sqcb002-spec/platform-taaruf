import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "Platform Ta'aruf Sunnah", description: "Proses ta'aruf yang terarah, aman, dan menjaga adab." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="id"><body>{children}</body></html>; }
