import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Uno de tinta por pantalla (la acción principal). Contorno para acciones
 * secundarias, texto para salidas suaves, rojo solo para destruir, azul para conectar.
 */
export type ButtonVariant = "ink" | "outline" | "text" | "danger" | "blue";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  /** Ocupa todo el ancho del contenedor. */
  block?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  ink: "bg-ink text-ink-inverse hover:bg-panel-2 hover:shadow-[0_8px_20px_-10px_rgba(21,32,27,0.55)]",
  outline: "border border-border-strong bg-surface text-ink hover:border-ink-3 hover:bg-hover",
  text: "text-ink-2 hover:bg-hover hover:text-ink",
  danger: "border border-danger text-danger hover:bg-danger-soft",
  blue: "bg-blue text-ink-inverse hover:brightness-95 hover:shadow-[0_6px_18px_-8px_rgba(31,91,209,0.6)]",
};

const baseClasses =
  "inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap " +
  "transition-[background-color,color,box-shadow,transform,translate,scale,rotate,opacity] duration-300 ease-[var(--ease-out-soft)] " +
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.985] active:duration-100";

/** Clases del botón para usarlas en enlaces u otros elementos. */
export function buttonClasses(variant: ButtonVariant = "ink", size: ButtonSize = "md", block = false): string {
  return cn(baseClasses, variant === "text" && "px-1.5", variantClasses[variant], sizeClasses[size], block && "w-full");
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 [&_svg]:size-3.5",
  md: "h-10 px-4 text-[13.5px] gap-2 [&_svg]:size-[15px]",
  lg: "h-12 px-5 text-base gap-2 [&_svg]:size-4",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "ink",
    size = "md",
    icon,
    iconRight,
    loading = false,
    block = false,
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(buttonClasses(variant, size, block), "disabled:pointer-events-none disabled:opacity-35", className)}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

/** Enlace con aspecto de botón (navegación), para no anidar <a> y <button>. */
export function ButtonLink({ href, variant = "ink", size = "md", icon, iconRight, block = false, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(buttonClasses(variant, size, block), className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
