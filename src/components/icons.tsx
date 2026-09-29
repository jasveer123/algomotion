// Line icons, Lucide style (2px stroke, 24px grid) — the design system ships no icon set.
import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...p,
});

export const IconPlay = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} fill="currentColor" stroke="none"><polygon points="7 4 20 12 7 20" /></svg>;
export const IconPause = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>;
export const IconNext = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="M5 4l10 8-10 8V4z" /><rect x="17" y="4" width="2.5" height="16" rx="1" /></svg>;
export const IconPrev = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="M19 20L9 12l10-8v16z" /><rect x="4.5" y="4" width="2.5" height="16" rx="1" /></svg>;
export const IconRestart = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 3 3 8 8 8" /></svg>;
export const IconCheck = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} strokeWidth={3}><polyline points="4 12 9 17 20 6" /></svg>;
export const IconArrows = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><polyline points="7 8 3 12 7 16" /><polyline points="17 8 21 12 17 16" /></svg>;
export const IconWindow = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="6" width="8" height="12" rx="1" /><rect x="13" y="3" width="8" height="18" rx="1" /></svg>;
export const IconBars = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="12" width="4" height="8" /><rect x="10" y="7" width="4" height="13" /><rect x="17" y="3" width="4" height="17" /></svg>;
export const IconHash = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>;
export const IconZap = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
export const IconShuffle = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>;
export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
export const IconSun = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
export const IconMoon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
export const IconLayers = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;

export const IconRelink = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="2" y="9" width="6" height="6" rx="1.5" /><rect x="16" y="9" width="6" height="6" rx="1.5" /><path d="M8 12h3" /><path d="M16 12c-2-5-6-5-8 0" /><polyline points="9.5 9 8 12 11 12.5" /></svg>;
export const IconChase = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="4" r="2" fill="currentColor" /><circle cx="19" cy="15" r="2" fill="currentColor" /></svg>;
export const IconZip = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 6h5l4 6h7" /><path d="M4 18h5l4-6" /><polyline points="17 9 20 12 17 15" /></svg>;
export const IconDigits = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="2" y="7" width="6" height="10" rx="1.5" /><rect x="9" y="7" width="6" height="10" rx="1.5" /><rect x="16" y="7" width="6" height="10" rx="1.5" /><path d="M5 10v4M12 10h1.5v4M18.5 10h2l-2 4" /></svg>;
export const IconKey = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3 21 2" /><path d="m16 7 3 3" /><path d="m18.5 4.5 2 2" /></svg>;

export const PATTERN_ICON = {
  "two-pointers": IconArrows, "sliding-window": IconWindow, "sorting-searching": IconBars, hashing: IconHash, greedy: IconZap,
  "ll-rewiring": IconRelink, "ll-fast-slow": IconChase, "ll-merge": IconZip, "ll-numbers": IconDigits, "ll-hash-walk": IconKey,
} as const;
