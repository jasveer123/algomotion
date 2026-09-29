// Typed port of the Neobrutalism `window.Neo` bundle (AlgoMotion design system, namespace `neo`).
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";
export { cx };

export type Tone = "coral" | "purple" | "teal" | "yellow" | "pink" | "lavender" | "green";
export type ButtonVariant = "primary" | "secondary" | "teal" | "pink" | "yellow" | "ghost";

type BtnOwn = { variant?: ButtonVariant; pill?: boolean; size?: "md" | "sm"; icon?: boolean };

export function Button({ variant = "primary", pill, size = "md", icon, className, type = "button", ...rest }: BtnOwn & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cx("nb-btn", `nb-btn-${variant}`, pill && "nb-btn-pill", size === "sm" && "nb-btn-sm", icon && "nb-btn-icon", className)}
      {...rest}
    />
  );
}

export function ButtonLink({ variant = "primary", pill, size = "md", className, href, ...rest }: BtnOwn & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href={href} className={cx("nb-btn", `nb-btn-${variant}`, pill && "nb-btn-pill", size === "sm" && "nb-btn-sm", className)} {...rest} />
  );
}

export function Card({ flat, large, interactive, as: As = "div", className, ...rest }: { flat?: boolean; large?: boolean; interactive?: boolean; as?: "div" | "section" | "article" | "aside" | "li" } & HTMLAttributes<HTMLElement>) {
  return <As className={cx("nb-card", flat && "nb-card-flat", large && "nb-card-lg", interactive && "nb-card-interactive", className)} {...rest} />;
}

export function Tag({ tone, flat, className, ...rest }: { tone?: Tone | "outline"; flat?: boolean } & HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("nb-tag", tone && tone !== "outline" && `nb-tone-${tone}`, flat && "nb-tag-flat", className)} {...rest} />;
}

export function IconBox({ tone = "teal", label, className, children }: { tone?: Tone; label?: string; className?: string; children: ReactNode }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <span className={cx("nb-icon-box", `nb-tone-${tone}`, className)} {...a11y}>
      {children}
    </span>
  );
}

export function Annotation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("nb-annotation", className)}>
      <span>{children}</span>
      <svg viewBox="0 0 64 48" width="48" height="36" aria-hidden="true" focusable="false">
        <path d="M6 6 C14 22 28 34 52 40 M52 40 L42 30 M52 40 L39 45" />
      </svg>
    </span>
  );
}

export { Input, Select } from "./form";
