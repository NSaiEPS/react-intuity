import { clearLocalStorage } from "./auth";

let routerInstance: any;

export const setRouter = (router: any) => {
  routerInstance = router;
};

export const navigateTo = (path: string, options?: any, message?: string) => {
  if (
    path == "/login" &&
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
