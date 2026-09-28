import { clearLocalStorage } from "./auth";

/** Minimal interface matching the router object returned by createBrowserRouter. */
interface RouterInstance {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown }
  ) => void | Promise<void>;
}

let routerInstance: RouterInstance | null = null;

export const setRouter = (router: RouterInstance) => {
  routerInstance = router;
};

export const isUnauthorizedMessage = (message?: string): boolean => {
  if (!message) return false;
  const lower = message.toLowerCase().trim();
  return (
    lower === "you are not authorized." ||
    lower === "you are not authorized" ||
    lower === "you are not authorised." ||
    lower === "you are not authorised" ||
    lower === "you are not authorised to use this api" ||
    lower === "you are not authorized to use this api"
  );
};

export const navigateTo = (
  path: string | number,
  options?: { replace?: boolean; state?: unknown },
  message?: string
) => {
  if (
    typeof path === "string" &&
    path.startsWith("/login") &&
    isUnauthorizedMessage(message)
  ) {
    clearLocalStorage();
  }
  if (routerInstance) {
    routerInstance.navigate(path, options);
  } else {
    console.warn("Router not set yet");
  }
};
