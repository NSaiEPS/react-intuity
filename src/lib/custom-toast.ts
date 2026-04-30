/**
 * custom-toast.ts
 * Drop-in replacement for `import { toast } from "react-toastify"`.
 * Uses a lightweight global event-emitter so it works from anywhere —
 * React components, Redux slices, plain TS modules, etc.
 *
 * API  (all params optional)
 *   toast.success(message?, subMessage?, onOk?)
 *   toast.error(message?, subMessage?, onOk?)
 *   toast.warning(message?, subMessage?, onOk?)   // also .warn()
 *
 *  message    → plain white-bg title  e.g. "Email Sent"
 *  subMessage → coloured-box text     e.g. "Please check your inbox…"
 *  onOk       → callback fired when user clicks OK
 */

export type ToastType = "success" | "error" | "warning";

export interface ToastPayload {
  type: ToastType;
  message: string;
  subMessage?: string; // ← 2nd optional text shown in the coloured box
  onOk?: () => void;   // ← optional fallback called when user clicks OK
  id: number;
}

type Listener = (payload: ToastPayload) => void;
type DismissListener = () => void;

let _listeners: Listener[] = [];
let _dismissListeners: DismissListener[] = [];
let _idCounter = 0;

export const toast = {
  success(message?: string, subMessage?: string, onOk?: () => void) {
    _emit({ type: "success", message: message ?? "", subMessage, onOk, id: ++_idCounter });
  },
  error(message?: string, subMessage?: string, onOk?: () => void) {
    _emit({ type: "error", message: message ?? "", subMessage, onOk, id: ++_idCounter });
  },
  warning(message?: string, subMessage?: string, onOk?: () => void) {
    _emit({ type: "warning", message: message ?? "", subMessage, onOk, id: ++_idCounter });
  },
  /** Alias — some code uses toast.warn() */
  warn(message?: string, subMessage?: string, onOk?: () => void) {
    _emit({ type: "warning", message: message ?? "", subMessage, onOk, id: ++_idCounter });
  },
  /** Programmatically dismiss the currently visible alert */
  dismiss() {
    _dismissListeners.forEach((l) => l());
  },

  // ─── internal subscription API (used by <CustomAlertModal>) ───────────────
  _subscribe(listener: Listener) {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  },
  _onDismiss(listener: DismissListener) {
    _dismissListeners.push(listener);
    return () => {
      _dismissListeners = _dismissListeners.filter((l) => l !== listener);
    };
  },
};

function _emit(payload: ToastPayload) {
  _listeners.forEach((l) => l(payload));
}
