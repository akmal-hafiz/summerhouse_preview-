"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/ui/liquid-glass";

export type LiquidGlassMenuVariant =
  | "drawer"
  | "dropdown"
  | "popover"
  | "compact"
  | "command"
  | "navigation"
  | "select"
  | "context"
  | "notifications";

type LiquidGlassMenuSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: LiquidGlassMenuVariant;
};

const variantClass: Record<LiquidGlassMenuVariant, string> = {
  drawer: "liquid-dropdown-content--drawer",
  dropdown: "liquid-dropdown-content--dropdown",
  popover: "liquid-dropdown-content--popover",
  compact: "liquid-dropdown-content--compact",
  command: "liquid-dropdown-content--command",
  navigation: "liquid-dropdown-content--navigation",
  select: "liquid-dropdown-content--select",
  context: "liquid-dropdown-content--context",
  notifications: "liquid-dropdown-content--notifications",
};

const radius: Record<LiquidGlassMenuVariant, string> = {
  drawer: "32px",
  dropdown: "20px",
  popover: "24px",
  compact: "18px",
  command: "24px",
  navigation: "22px",
  select: "20px",
  context: "18px",
  notifications: "24px",
};

export function LiquidGlassMenuSurface({
  children,
  className,
  variant = "dropdown",
  ...props
}: LiquidGlassMenuSurfaceProps) {
  const isDrawer = variant === "drawer";

  return (
    <LiquidGlass
      blurIntensity={isDrawer ? "xl" : "lg"}
      glowIntensity={isDrawer ? "md" : "sm"}
      shadowIntensity={isDrawer ? "lg" : "md"}
      borderRadius={radius[variant]}
      width="100%"
      height="auto"
      className={cn(
        "liquid-dropdown-content",
        "relative isolate text-foreground supports-[backdrop-filter]:bg-transparent",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

export const LiquidDropdownSurface = LiquidGlassMenuSurface;
