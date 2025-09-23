import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

export default function RouteErrorBoundary() {
  const error: any = useRouteError();
  console.error("Route error:", error);
  useEffect(() => {
    if (
      error instanceof Error &&
      error.message.includes("Failed to fetch dynamically imported module")
    ) {
      console.warn("Chunk load failed. Reloading app...");
      setTimeout(() => {
        window.location.reload();
      }, 1000); // smooth 1s reload
    }
  }, [error]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {error.message.includes("Failed to fetch dynamically imported module") ? (
        <>
          <h2>Reloading...</h2>
          <h2>Loading Fresh Content</h2>
          <p>Please hold on — we’re refreshing your experience.</p>
        </>
      ) : (
        <>
          <h2>Something went wrong.</h2>
          <p>
            An unexpected error occurred. Please try refreshing the page, or
            contact support if the problem persists.
          </p>
        </>
      )}
    </div>
  );
}
