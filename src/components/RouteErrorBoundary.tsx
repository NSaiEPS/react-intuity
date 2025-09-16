import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  console.error('Route error:', error);
  useEffect(() => {
    if (error instanceof Error && error.message.includes('Failed to fetch dynamically imported module')) {
      console.warn('Chunk load failed. Reloading app...');
      setTimeout(() => {
        window.location.reload();
      }, 1000); // smooth 1s reload
    }
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p>We’re refreshing the app, please wait…</p>
    </div>
  );
}
