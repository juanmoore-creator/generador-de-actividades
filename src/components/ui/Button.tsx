import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-xs shadow-primary/25",
  secondary: "bg-surface text-ink border border-line-strong hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  accent: "bg-accent-soft text-accent-ink hover:brightness-95 dark:hover:brightness-125",
  danger: "bg-danger-soft text-danger-ink hover:brightness-95 dark:hover:brightness-125",
  soft: "bg-surface-2 text-ink hover:bg-surface-3",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-base gap-2 rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] motion-reduce:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "children" | "icon"> {
  label: string;
  icon: React.ReactNode;
}

/** Botón sólo con ícono: siempre lleva un nombre accesible y área táctil de 44px. */
export function IconButton({ label, icon, size = "md", className, ...rest }: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={label}
      size={size}
      className={cn(size === "sm" ? "w-9 px-0" : size === "lg" ? "w-12 px-0" : "w-11 px-0", className)}
      icon={icon}
      {...rest}
    />
  );
}
