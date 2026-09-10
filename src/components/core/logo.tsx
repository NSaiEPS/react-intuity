import * as React from "react";
import { useColorScheme } from "@mui/material/styles";

const HEIGHT = 60;
const WIDTH = 60;

type Color = "dark" | "light";

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
  src?: string | null;
  style?: React.CSSProperties;
}

export function Logo({
  color = "dark",
  emblem,
  height = HEIGHT,
  width = WIDTH,
  src = null,
  style,
}: LogoProps): React.JSX.Element {
  let url: string;

  if (emblem) {
    url = color === "light" ? "/assets/logo-white.png" : "/assets/logo rgb.jpg";
  } else {
    url = color === "light" ? "/assets/logo-white.png" : "/assets/logo rgb.jpg";
  }

  return (
    <img
      alt="logo"
      height={height}
      width={src ? undefined : width}
      src={src ?? url}
      loading="eager"           // ✅ load immediately
      fetchPriority="high"
      style={{
        display: "block",
        cursor: "pointer",
        objectFit: "contain",
        height: height,
        width: src ? "auto" : width,
        maxWidth: width ? `${width}px` : "100%",
        ...style,
      }}
    />
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
  style?: React.CSSProperties;
  src?: null;
}

export function DynamicLogo({
  colorDark = "light",
  colorLight = "dark",
  height = HEIGHT,
  width = WIDTH,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === "dark" ? colorDark : colorLight;

  return <Logo color={color} height={height} width={width}
    style={{
      cursor: "pointer",
    }}
    {...props}

  />;
}
