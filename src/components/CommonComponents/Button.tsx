import React, { CSSProperties, JSX, MouseEventHandler, useRef } from "react";

type Variant = "contained" | "outlined" | "text";
type Size = "small" | "medium" | "large";
type LoadingPosition = "start" | "end" | "center";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
  color?: keyof typeof defaultColors | string;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingPosition?: LoadingPosition;
  hideChildrenWhenLoading?: boolean;
  textDecoration?: CSSProperties["textDecoration"];
  textTransform?: CSSProperties["textTransform"];
  hoverBackgroundColor?: string;
  hoverColor?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  bgColor?: string;
  style?: CSSProperties;
}

const generateClassName = (): string =>
  `btn-${Math.random().toString(36).substr(2, 9)}`;

const defaultColors = {
  primary: "#1976d2",
  secondary: "#9c27b0",
  inherit: "inherit",
  success: "green",
};

const variantStyles = (
  variant: Variant,
  colorValue: string
): {
  base: CSSProperties;
  backgroundColor?: string;
  textColor: string;
} => {
  switch (variant) {
    case "contained":
      return {
        base: {
          color: "#fff",
          border: "none",
          boxShadow:
            "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
        },
        backgroundColor: colorValue,
        textColor: "#fff",
      };
    case "outlined":
      return {
        base: {
          backgroundColor: "transparent",
          border: `1px solid ${colorValue}`,
        },
        textColor: colorValue,
      };
    case "text":
    default:
      return {
        base: {
          backgroundColor: "transparent",
          border: "none",
        },
        textColor: colorValue,
      };
  }
};

const sizeStyles: Record<Size, CSSProperties> = {
  small: {
    padding: "4px 10px",
    fontSize: 13,
    minWidth: 64,
    height: 32,
  },
  medium: {
    padding: "8px 14px",
    fontSize: 14,
    minWidth: 64,
    height: 36,
  },
  large: {
    padding: "8px 22px",
    fontSize: 15,
    minWidth: 64,
    height: 40,
  },
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  type = "button",
  style = {},
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingPosition = "start",
  hideChildrenWhenLoading = false,
  textDecoration = "none",
  textTransform = "uppercase",
  hoverBackgroundColor,
  hoverColor,
  onClick,
  bgColor = defaultColors.primary,
  ...props
}): JSX.Element => {
  const classNameRef = useRef(generateClassName());
  const className = classNameRef.current;
  const isDisabled = disabled || loading;

  const colorValue =
    bgColor || defaultColors[color as keyof typeof defaultColors] || color;
  const { base, backgroundColor, textColor } = variantStyles(
    variant,
    colorValue
  );

  const buttonStyle: CSSProperties = {
    ...base,
    ...sizeStyles[size],
    display: "inline-flex",
    alignItems: "center",
    justifyContent:
      loading && loadingPosition === "center" ? "center" : "center",
    width: fullWidth ? "100%" : "auto",
    borderRadius: 4,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: "all 0.2s ease",
    textDecoration,
    textTransform,
    lineHeight: 1.5,
    fontFamily: "inherit",
    ...(hoverBackgroundColor ? {} : { backgroundColor }),
    ...(hoverColor ? {} : { color: textColor }),
    ...style,
  };

  const Spinner = (
    <span
      style={{
        width: 16,
        height: 16,
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        display: "inline-block",
        flexShrink: 0,
        margin:
          loadingPosition === "start"
            ? "0 8px 0 0"
            : loadingPosition === "end"
            ? "0 0 0 8px"
            : "0",
      }}
    />
  );

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .${className} {
            ${
              hoverBackgroundColor
                ? `background-color: ${backgroundColor};`
                : ""
            }
            ${hoverColor ? `color: ${textColor};` : ""}
          }

          .${className}:hover {
            ${
              hoverBackgroundColor
                ? `background-color: ${hoverBackgroundColor};`
                : ""
            }
            ${hoverColor ? `color: ${hoverColor};` : ""}
          }
        `}
      </style>

      <button
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        onClick={onClick}
        className={className}
        style={buttonStyle}
        {...props}
      >
        {loading && loadingPosition === "start" && Spinner}
        {!loading || !hideChildrenWhenLoading ? children : null}
        {loading && loadingPosition === "end" && Spinner}
        {loading && loadingPosition === "center" && Spinner}
      </button>
    </>
  );
};

export default Button;
