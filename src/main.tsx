import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import './styles/global.css'; // global styles

import { router } from './App';
import Layout from './components/core/layout';
import { LoadingProvider } from './components/core/skeletion-context';
import { UserProvider } from './contexts/user-context';
import { setRouter } from './utils/navigation';

setRouter(router);

window.addEventListener('error', (e) => {
  console.log(e.message);
  if (e.message?.includes('Failed to fetch dynamically imported module')) {
    console.warn('Chunk load failed. Reloading app...');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <LoadingProvider>
        <Layout>
          <RouterProvider router={router} />
        </Layout>
      </LoadingProvider>
    </UserProvider>
  </React.StrictMode>
);
