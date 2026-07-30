import { useEffect } from "react";

export function usePreloadDashboardRoutes() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ preload critical dashboard routes

      import("../pages/dashboard/last-bill/page");
      import("../pages/dashboard/usage-alerts/page");
      import("../pages/dashboard/payment-methods/page");
      import("../pages/dashboard/notification-settings/page");
    }, 1000); // 1s delay for smoothness

    return () => clearTimeout(timer);
  }, []);
}
