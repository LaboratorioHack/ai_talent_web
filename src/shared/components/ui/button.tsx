import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
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
  ink: "bg-ink text-ink-inverse hover:bg-panel-2",
  outline: "border border-ink text-ink hover:bg-surface-2",
  text: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "border border-danger text-danger hover:bg-danger-soft",
  blue: "bg-blue text-ink-inverse hover:brightness-95",
};

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
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors",
        "disabled:pointer-events-none disabled:opacity-35",
        variant === "text" ? "px-1.5" : null,
        variantClasses[variant],
        sizeClasses[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
});
