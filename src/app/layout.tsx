import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-dm-sans" });
const caveat = Caveat({ subsets: ["latin"], weight: ["700"], variable: "--font-caveat" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "algomotion — watch data structures think", template: "%s · algomotion" },
  description: "Arrays and linked lists from the Love Babbar 450 sheet, taught through step-by-step animations, pattern recognition and brute-force-to-optimal solutions.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafadf" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

// Applies a saved theme before first paint (see docs: preventing flash before hydration).
const THEME_BOOT = `try{var t=localStorage.getItem("algomotion.theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${caveat.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">skip to content</a>
        <div className="am-shell">
          <SiteNav />
          <main id="main" className="am-main" tabIndex={-1}>
            {children}
          </main>
          <footer className="am-footer">
            <p>algomotion · arrays & linked lists · problems from the love babbar dsa sheet, built on the neobrutalism design system. <Link href="/lab">try the data-structure lab</Link>.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
