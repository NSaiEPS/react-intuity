import * as React from "react";
import { toast, ToastPayload } from "@/lib/custom-toast";

// ─── Style helpers ────────────────────────────────────────────────────────────

function getStyles(type: "success" | "error" | "warning") {
  if (type === "success") return {
    iconBg: "#3A9E5F",
    iconSymbol: "✓",
    iconFontSize: "2rem",
    boxBg: "#FFF2CC",
    boxColor: "#5C4700",
  };
  if (type === "error") return {
    iconBg: "#D95C4A",
    iconSymbol: "!",
    iconFontSize: "1.75rem",
    boxBg: "#FDE8E8",
    boxColor: "#8B1A1A",
  };
  return {
    iconBg: "#E07B2A",
    iconSymbol: "!",
    iconFontSize: "1.75rem",
    boxBg: "#FFF3E0",
    boxColor: "#7A4000",
  };
}

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
  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#1a1a1a",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.3,
  },
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
  progressTrack: {
    width: "100%",
    height: "4px",
    backgroundColor: "#e0e0e0",
    borderRadius: "2px",
    overflow: "hidden",
    marginTop: "0.2rem",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B5EA6",
  },
  countdown: {
    fontSize: "0.78rem",
    color: "#888",
    margin: 0,
    marginTop: "-0.4rem",
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_CLOSE_MS = 10000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomAlertModal() {
  const [payload, setPayload] = React.useState<ToastPayload | null>(null);
  const [progress, setProgress] = React.useState(100);
  const [secsLeft, setSecsLeft] = React.useState(5);
  const [hovered, setHovered] = React.useState(false);

  const rafRef     = React.useRef<number | null>(null);
  const startRef   = React.useRef<number | null>(null);
  const elapsedRef = React.useRef(0);
  const hoveredRef = React.useRef(false);

  // keep ref in sync so rAF closure always reads latest hover value
  React.useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  // subscribe to toast singleton
  React.useEffect(() => {
    const unsubToast = toast._subscribe((p) => {
      setPayload(p);
      setProgress(100);
      setSecsLeft(5);
      setHovered(false);
      elapsedRef.current = 0;
      startRef.current = null;
    });
    const unsubDismiss = toast._onDismiss(() => setPayload(null));
    return () => {
      unsubToast();
      unsubDismiss();
    };
  }, []);

  // progress bar rAF loop — skipped for errors (must close manually)
  React.useEffect(() => {
    if (!payload || payload.type === "error") {
      elapsedRef.current = 0;
      startRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const delta = ts - startRef.current;
      startRef.current = ts;

      if (!hoveredRef.current) {
        elapsedRef.current = Math.min(elapsedRef.current + delta, AUTO_CLOSE_MS);
      }

      const pct = (elapsedRef.current / AUTO_CLOSE_MS) * 100;
      setProgress(100 - pct);
      setSecsLeft(Math.ceil((AUTO_CLOSE_MS - elapsedRef.current) / 1000));

      if (elapsedRef.current >= AUTO_CLOSE_MS) {
        setPayload(null);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [payload]);

  if (!payload) return null;

  const tk = getStyles(payload.type);

  const handleOk = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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

      {/* Backdrop — errors only close via OK button */}
      <div style={S.backdrop} onClick={() => payload.type !== "error" && setPayload(null)}>
        <div
          style={S.modal}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >

          {/* Icon circle */}
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

          {/* Title */}
          {payload.message && (
            <p style={S.title}>{payload.message}</p>
          )}

          {/* Sub-message */}
          {payload.subMessage && (
            <div style={{ ...S.subBox, backgroundColor: tk.boxBg, color: tk.boxColor }}>
              {payload.subMessage}
            </div>
          )}

          {/* OK button */}
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

          {/* Progress bar — hidden for errors (no auto-close) */}
          {payload.type !== "error" && (
            <div style={S.progressTrack}>
              <div style={{ ...S.progressBar, width: `${progress}%` }} />
            </div>
          )}

          {/* Countdown label */}
          {/* <p style={S.countdown}>
            {hovered ? "Paused" : `Closing in ${secsLeft}s`}
          </p> */}

        </div>
      </div>
    </>
  );
}