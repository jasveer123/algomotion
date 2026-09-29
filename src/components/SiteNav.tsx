"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "./icons";

const LINKS = [
  { href: "/", label: "patterns" },
  { href: "/lessons", label: "lessons" },
  { href: "/visualizer", label: "visualizer" },
  { href: "/lab", label: "lab" },
];

const THEME_KEY = "algomotion.theme";
const themeListeners = new Set<() => void>();
function currentTheme(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => { themeListeners.delete(cb); mq.removeEventListener("change", cb); };
}

export function SiteNav() {
  const path = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "light" as const);
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* per-viewer convenience only */ }
    themeListeners.forEach((l) => l());
  };
  const active = (href: string) => (href === "/" ? path === "/" : href.startsWith("/lessons") ? path.startsWith("/lessons") : path.startsWith(href));
  return (
    <nav className="nb-nav" aria-label="main">
      <Link href="/" className="nb-nav-brand" aria-label="algomotion home">
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
          <rect x="1.5" y="9" width="7" height="10" rx="2" fill="var(--color-teal)" stroke="var(--border-color)" strokeWidth="2" />
          <rect x="10.5" y="4" width="7" height="15" rx="2" fill="var(--color-secondary)" stroke="var(--border-color)" strokeWidth="2" />
          <rect x="19.5" y="12" width="7" height="7" rx="2" fill="var(--state-confirmed)" stroke="var(--border-color)" strokeWidth="2" />
          <path d="M3 24 H25" stroke="var(--border-color)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        algomotion
      </Link>
      <ul className="nb-nav-links">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="nb-nav-link" aria-current={active(l.href) ? "page" : undefined}>{l.label}</Link>
          </li>
        ))}
        <li>
          <button type="button" className="nb-nav-link" onClick={flip} aria-label={`switch to ${theme === "dark" ? "light" : "dark"} theme`} style={{ background: "transparent", cursor: "pointer" }}>
            {theme === "dark" ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
          </button>
        </li>
      </ul>
    </nav>
  );
}

