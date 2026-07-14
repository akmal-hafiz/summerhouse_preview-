"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type LiquidGlassIntensity = "none" | "sm" | "md" | "lg" | "xl";

type LiquidGlassProps = React.HTMLAttributes<HTMLDivElement> & {
  blurIntensity?: LiquidGlassIntensity;
  glowIntensity?: LiquidGlassIntensity;
  shadowIntensity?: LiquidGlassIntensity;
  borderRadius?: string;
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
};

type LiquidGlassStyle = React.CSSProperties & {
  "--liquid-glass-radius"?: string;
};

export function LiquidGlass({
  blurIntensity = "lg",
  glowIntensity = "sm",
  shadowIntensity = "md",
  borderRadius = "16px",
  width,
  height,
  className,
  style,
  children,
  ...props
}: LiquidGlassProps) {
  const mergedStyle: LiquidGlassStyle = {
    "--liquid-glass-radius": borderRadius,
    width,
    height,
    ...style,
  };

  return (
    <div
      data-liquid-glass
      data-blur={blurIntensity}
      data-glow={glowIntensity}
      data-shadow={shadowIntensity}
      className={cn("liquid-glass", className)}
      style={mergedStyle}
      {...props}
    >
      {children}
    </div>
  );
}
