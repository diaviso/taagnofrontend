"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "solid" | "soft" | "outline" | "ghost" | "danger" | "white" | "dark";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-200 " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-gradient text-white shadow-glow hover:brightness-110 hover:shadow-lg",
  solid: "bg-brand text-white hover:bg-brand-dark",
  soft: "bg-brand-soft text-brand hover:brightness-95",
  outline: "border border-line bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/40",
  ghost: "text-ink-soft hover:bg-surface-alt hover:text-ink",
  danger: "bg-danger/10 text-danger hover:bg-danger hover:text-white",
  white: "bg-white text-brand-dark shadow-soft hover:bg-white/90",
  dark: "bg-ink text-white hover:bg-ink-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-[10px] px-3.5 text-[13px]",
  md: "h-11 rounded-[12px] px-5 text-[14.5px]",
  lg: "h-12 rounded-[14px] px-6 text-[15px]",
  xl: "h-14 rounded-[16px] px-7 text-base",
  icon: "h-11 w-11 rounded-[12px]",
  "icon-sm": "h-9 w-9 rounded-[10px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, iconRight, block, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClass(variant, size, cn(block && "w-full", className))}
      {...rest}
    >
      {loading ? <Spinner className="h-4.5 w-4.5" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

export function LinkButton({ variant = "primary", size = "md", icon, iconRight, block, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, cn(block && "w-full", className))} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
