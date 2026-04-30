/**
 * CustomAlertModal.tsx
 * Global alert modal that replaces react-toastify toast UI.
 * Mount once inside <Layout> — it subscribes to the custom-toast singleton
 * and renders the appropriate success / error / warning dialog.
 */

import * as React from "react";
import { toast, ToastPayload, ToastType } from "@/lib/custom-toast";

// ─── Inline styles (no extra CSS file needed) ────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "2rem 2rem 1.5rem",
    maxWidth: "360px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    animation: "cam-fade-in 0.2s ease",
  },
  iconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  messageBox: {
    width: "100%",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    textAlign: "center",
    fontWeight: 600,
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  okButton: {
    marginTop: "0.25rem",
    backgroundColor: "#3B5EA6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 2.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
};

// ─── Per-type colour tokens ───────────────────────────────────────────────────

const typeConfig: Record<
  ToastType,
  { iconBg: string; iconColor: string; symbol: string; messageBg: string; messageColor: string }
> = {
  success: {
    iconBg: "#3A9E5F",
    iconColor: "#ffffff",
    symbol: "✓",
    messageBg: "#FFFBE6",
    messageColor: "#7A6000",
  },
  error: {
    iconBg: "#D95C4A",
    iconColor: "#ffffff",
    symbol: "!",
    messageBg: "#FDE8E8",
    messageColor: "#8B1A1A",
  },
  warning: {
    iconBg: "#E07B2A",
    iconColor: "#ffffff",
    symbol: "!",
    messageBg: "#FFF3E0",
    messageColor: "#7A4000",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomAlertModal() {
  const [payload, setPayload] = React.useState<ToastPayload | null>(null);

  React.useEffect(() => {
    const unsubToast = toast._subscribe((p) => setPayload(p));
    const unsubDismiss = toast._onDismiss(() => setPayload(null));
    return () => {
      unsubToast();
      unsubDismiss();
    };
  }, []);

  if (!payload) return null;

  const cfg = typeConfig[payload.type];

  return (
    <>
      {/* Keyframe injected once */}
      <style>{`
        @keyframes cam-fade-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={styles.backdrop} onClick={() => setPayload(null)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Icon circle */}
          <div style={{ ...styles.iconCircle, backgroundColor: cfg.iconBg }}>
            <span
              style={{
                color: cfg.iconColor,
                fontSize: payload.type === "success" ? "2rem" : "1.75rem",
                fontWeight: 900,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {cfg.symbol}
            </span>
          </div>

          {/* Message box */}
          <div
            style={{
              ...styles.messageBox,
              backgroundColor: cfg.messageBg,
              color: cfg.messageColor,
            }}
          >
            {payload.message}
          </div>

          {/* OK button */}
          <button
            style={styles.okButton}
            onClick={() => setPayload(null)}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2d4a88")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3B5EA6")
            }
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}
