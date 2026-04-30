/**
 * CustomAlertModal.tsx
 * Global alert modal — mounts once in <Layout>.
 * Subscribes to the custom-toast singleton and renders
 * the success / error / warning dialog.
 *
 * Visual layout (matches client spec):
 *   ┌──────────────────────────────┐
 *   │       [icon circle]          │
 *   │                              │
 *   │   message   ← white-bg title │  e.g. "Email Sent"
 *   │                              │
 *   │ ┌──────────────────────────┐ │
 *   │ │  subMessage (coloured)   │ │  e.g. "Please check your inbox…"
 *   │ └──────────────────────────┘ │  yellow / pink / orange bg
 *   │           [ OK ]             │
 *   └──────────────────────────────┘
 *
 * Both `message` and `subMessage` are fully optional:
 *   toast.success("Email Sent", "Please check your inbox…", onOk?)
 *   toast.success("Email Sent")
 *   toast.error("Something went wrong.")
 */

import * as React from "react";
import { toast, ToastPayload, ToastType } from "@/lib/custom-toast";

// ─── Design tokens ────────────────────────────────────────────────────────────

const TOKEN: Record<
  ToastType,
  {
    iconBg: string;
    iconSymbol: string;
    iconFontSize: string;
    boxBg: string;     // subMessage coloured-box background
    boxColor: string;
  }
> = {
  success: {
    iconBg: "#3A9E5F",
    iconSymbol: "✓",
    iconFontSize: "2rem",
    boxBg: "#FFF2CC",    // RGB 255 242 204 — exact hex from client screenshot
    boxColor: "#5C4700",
  },
  error: {
    iconBg: "#D95C4A",
    iconSymbol: "!",
    iconFontSize: "1.75rem",
    boxBg: "#FDE8E8",
    boxColor: "#8B1A1A",
  },
  warning: {
    iconBg: "#E07B2A",
    iconSymbol: "!",
    iconFontSize: "1.75rem",
    boxBg: "#FFF3E0",
    boxColor: "#7A4000",
  },
};

// ─── Static styles ────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "2rem 1.75rem 1.5rem",
    maxWidth: "340px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.9rem",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    animation: "cam-fadein 0.2s ease",
  },
  iconCircle: {
    width: "66px",
    height: "66px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // ① message — plain white-bg heading
  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#1a1a1a",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.3,
  },
  // ② subMessage — coloured box
  subBox: {
    width: "100%",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "0.93rem",
    lineHeight: 1.55,
  },
  okBtn: {
    marginTop: "0.15rem",
    backgroundColor: "#3B5EA6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.55rem 2.8rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "background-color 0.15s ease",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomAlertModal() {
  const [payload, setPayload] = React.useState<ToastPayload | null>(null);

  React.useEffect(() => {
    const unsubToast   = toast._subscribe((p) => setPayload(p));
    const unsubDismiss = toast._onDismiss(() => setPayload(null));
    return () => { unsubToast(); unsubDismiss(); };
  }, []);

  if (!payload) return null;

  const tk = TOKEN[payload.type];

  /** Close modal and fire optional onOk callback */
  const handleOk = () => {
    setPayload(null);
    payload.onOk?.();
  };

  return (
    <>
      <style>{`
        @keyframes cam-fadein {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1);   }
        }
      `}</style>

      {/* Backdrop — click outside closes (no callback fired) */}
      <div style={S.backdrop} onClick={() => setPayload(null)}>
        <div style={S.modal} onClick={(e) => e.stopPropagation()}>

          {/* ① Icon circle */}
          <div style={{ ...S.iconCircle, backgroundColor: tk.iconBg }}>
            <span style={{
              color: "#fff",
              fontSize: tk.iconFontSize,
              fontWeight: 900,
              lineHeight: 1,
              userSelect: "none",
            }}>
              {tk.iconSymbol}
            </span>
          </div>

          {/* ② message — white-bg title, shown when provided */}
          {payload.message && (
            <p style={S.title}>{payload.message}</p>
          )}

          {/* ③ subMessage — coloured box, shown when provided */}
          {payload.subMessage && (
            <div style={{ ...S.subBox, backgroundColor: tk.boxBg, color: tk.boxColor }}>
              {payload.subMessage}
            </div>
          )}

          {/* ④ OK button */}
          <button
            style={S.okBtn}
            onClick={handleOk}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2d4a88";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3B5EA6";
            }}
          >
            OK
          </button>

        </div>
      </div>
    </>
  );
}
