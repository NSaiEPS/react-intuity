/**
 * custom-toast.ts
 * Drop-in replacement for `import { toast } from "react-toastify"`.
 * Uses a lightweight global event-emitter so it works from anywhere —
 * React components, Redux slices, plain TS modules, etc.
 */

export type ToastType = "success" | "error" | "warning";

export interface ToastPayload {
  type: ToastType;
  message: string;
  id: number;
}

type Listener = (payload: ToastPayload) => void;
type DismissListener = () => void;

let _listeners: Listener[] = [];
let _dismissListeners: DismissListener[] = [];
let _idCounter = 0;

export const toast = {
  success(message: string) {
    _emit({ type: "success", message, id: ++_idCounter });
  },
  error(message: string) {
    _emit({ type: "error", message, id: ++_idCounter });
  },
  warning(message: string) {
    _emit({ type: "warning", message, id: ++_idCounter });
  },
  /** Alias — some code uses toast.warn() */
  warn(message: string) {
    _emit({ type: "warning", message, id: ++_idCounter });
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
