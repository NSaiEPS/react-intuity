import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

import "./styles/global.css"; // global styles

import { router } from "./App";
import Layout from "./components/core/layout";
import { LoadingProvider } from "./components/core/skeleton-context";
import { UserProvider } from "./contexts/user-context";
import { setRouter } from "./utils/navigation";
setRouter(router);


const isLoggedIn = secureLocalStorage.getItem("intuity-is-logged-in");
document.getElementById("init-loader")?.remove();

isLoggedIn
  ? import("./pages/dashboard/page")
  : import("./components/auth/sign-in-page");
window.addEventListener("error", (e) => {
  if (e.message?.includes("Failed to fetch dynamically imported module")) {
    const reloadCount = parseInt(sessionStorage.getItem("chunk-reload-count") ?? "0", 10);
    if (reloadCount >= 3) {
      console.error("Chunk load failed after 3 retries. Check your connection.");
      return;
    }
    sessionStorage.setItem("chunk-reload-count", String(reloadCount + 1));
    window.location.reload();
  }
});



class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>Something went wrong</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Please refresh the page. If the problem persists, contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <UserProvider>
        <LoadingProvider>
          <Layout>
            <RouterProvider router={router} />
          </Layout>
        </LoadingProvider>
      </UserProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
