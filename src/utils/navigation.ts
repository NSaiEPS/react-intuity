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

export const navigateTo = (
  path: string | number,
  options?: { replace?: boolean; state?: unknown },
  message?: string
) => {
  if (
    path === "/login" &&
    message === "You are not authorised to use this api"
  ) {
    clearLocalStorage();
  }
  if (routerInstance) {
    routerInstance.navigate(path, options);
  } else {
    console.warn("Router not set yet");
  }
};
