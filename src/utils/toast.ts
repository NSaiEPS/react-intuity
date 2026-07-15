import { toast } from "react-toastify";

const originalSuccess = toast.success.bind(toast);
const originalError = toast.error.bind(toast);
const originalInfo = toast.info.bind(toast);
const originalWarn = toast.warn.bind(toast);

toast.success = (...args) => {
  toast.dismiss();
  return originalSuccess(...args);
};

toast.error = (...args) => {
  toast.dismiss();
  return originalError(...args);
};

toast.info = (...args) => {
  toast.dismiss();
  return originalInfo(...args);
};

toast.warn = (...args) => {
  toast.dismiss();
  return originalWarn(...args);
};

export { toast };